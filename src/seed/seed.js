// src/seed/seed.js
const fs = require('fs');
const path = require('path');
const { Subject, User, Post, Comment, Degree } = require('../models');

/**
 * Lee un archivo CSV y devuelve un array de objetos
 * @param {string} filePath - Ruta al archivo CSV
 * @returns {Array} - Array de objetos con los datos del CSV
 */
function readCSV(filePath) {

    const content = fs.readFileSync(filePath, 'utf-8');

    // Usar regex para separar por coma (puede tener \r antes de \n)
    const lines = content.trim().split(/\r?\n/);
    
    // Limpiar cada header: trim() + eliminar \r si quedó
    const headers = lines[0].split(',').map(h => h.trim().replace('\r', ''));
    
    const results = [];
    for (let i = 1; i < lines.length; i++) {

        // lines[i] = "1,Análisis Matemático I,1,Anual,5,Ciencias Básicas"
        // values = [1, Análisis Matemático I, "1", Anual, "5", "Ciencias Básicas"]
        const values = lines[i].split(',');
        const row = {};
        
        // ["id",nombre,nivel,"regimen","carga_horaria","carrera"]
        headers.forEach((header, index) => {
            let value = values[index]?.trim();    // "1"
            
            // Convertir números si corresponde
            if (!isNaN(value) && value !== '') {
                value = Number(value);
            }
            
            row[header] = value;
        });
        
        results.push(row);
    }
    
    return results;
}


/**
 * Carga usuarios desde CSV usando bulkCreate para minimizar hits a la DB
 */
async function seedUsers() {
    // Leer usuarios desde archivo CSV
    const users = readCSV(path.join(__dirname, 'data', 'users.csv'));

    // Verificar si ya existen usuarios en la DB
    const exists = await User.findOne();
    if (exists) {
        console.log(`✅ Usuarios YA cargados`);
        return;
    }

    // Mapear los datos del CSV al formato del modelo User
    // El CSV tiene columnas: first_name, last_name, email, birth_date
    const usersData = users.map(u => ({
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        birthDate: u.birth_date
    }));

    // Bulk insert - UN SOLO hit a la DB
    // ignoreDuplicates: true evita errores si algún email ya existe (basado en unique constraint)
    await User.bulkCreate(usersData, {
        ignoreDuplicates: true
    });
    
    console.log(`✅ ${users.length} usuarios cargados (1 bulk insert)`);
}

/**
 * Carga posts desde CSV
 */
async function seedPosts() {
    const posts = readCSV(path.join(__dirname, 'data', 'posts.csv'));
    
    const count = await Post.count();
    if (count > 0) {
        console.log(`✅ Posts YA cargados (${count} existentes)`);
        return;
    }

    const exists = await Post.findOne();
    if (exists) {
        console.log(`✅ Posts YA cargados`);
        return;
    }

    // VERIFICAR QUE LOS AUTORES EXISTEN
    const authorIds = [...new Set(posts.map(p => p.author_id))];
    const existingAuthors = await User.findAll({
        where: { id: authorIds },
        attributes: ['id']
    });
    
    const existingIds = new Set(existingAuthors.map(a => a.id));
    const missingAuthors = authorIds.filter(id => !existingIds.has(id));
    
    if (missingAuthors.length > 0) {
        console.error(`❌ Faltan usuarios con IDs: ${missingAuthors.join(', ')}`);
        console.error(`   Ejecutá seedUsers() primero`);
        return;
    }
    
    console.log(`✅ Todos los autores existen (${authorIds.length} usuarios)`);
    
    const postsData = posts.map(p => ({
        title: p.title,
        authorId: p.author_id,
        subjectId: p.subject_id,
        createdAt: p.created_at
    }));
    
    try {
        await Post.bulkCreate(postsData, { ignoreDuplicates: true });
        // await Post.bulkCreate(postsData);
        console.log(`✅ ${posts.length} posts cargados (1 bulk insert)`);
    } catch (error) {
        console.error('❌ Error al crear posts:', error.message);
        console.error('Detalles:', error.original);
    }
}

/**
 * Carga comentarios desde CSV
 */
async function seedComments() {
    const comments = readCSV(path.join(__dirname, 'data', 'comments.csv'));
    
    const exists = await Comment.findOne();
    if (exists) {
        console.log(`✅ Comentarios YA cargados`);
        return;
    }
    
    const commentsData = comments.map(c => ({
        content: c.content,
        userId: c.user_id,
        postId: c.post_id,
        createdAt: c.created_at
    }));
    
    await Comment.bulkCreate(commentsData, { ignoreDuplicates: true });
    
    console.log(`✅ ${comments.length} comentarios cargados (1 bulk insert)`);
}

/**
 * Carga materias desde CSV usando bulkCreate para minimizar hits a la DB
 */
async function seedSubjects() {
    const subjects = readCSV(path.join(__dirname, 'data', 'subjects.csv'));
    

    const exists = await Subject.findOne();  // Solo trae 1 registro
    if (exists) {
        console.log(`✅ materias YA cargadas`);
        return;
    }
    
    /* 
        subject = {
            id: 1,
            nombre: "algo",
            nivel: 2
            carrera: "Ciencias Básicas" ó "Ing en sistemas"
        }
    */  
    // 1. Extraer todas las carreras únicas del CSV
    const uniqueCareers = [...new Set(subjects.map(s => s.carrera))];
    
    // 2. Obtener o crear Degrees (solo 1 hit por carrera única, máximo 2 o 3)
    const degreeMap = new Map();
    for (const careerName of uniqueCareers) {
        const [degree] = await Degree.findOrCreate({
            where: { name: careerName },
            defaults: { name: careerName }
        });
        degreeMap.set(careerName, degree.id);

        /*
        degreeMap = {
            "Ciencias Básicas": 1,
            "Ing sistemas": 2
        }
        */
    }

    // 3. Preparar datos de Subjects para bulkCreate
    const subjectsData = subjects.map(subject => ({
        name: subject.nombre,
        year: subject.nivel,
        degreeId: degreeMap.get(subject.carrera)
    }));
    
    // 4. Bulk insert - UN SOLO hit a la DB
    await Subject.bulkCreate(subjectsData, {
        ignoreDuplicates: true  // Evita errores si ya existen (similar a findOrCreate)
    });
    
    console.log(`✅ ${subjects.length} materias cargadas (${degreeMap.size} degrees, 1 bulk insert)`);
}


/**
 * Función principal para ejecutar todo el seeding
 */
async function runSeed() {
    try {
        console.log('🌱 Iniciando seeding...');
        
        await seedSubjects();
        await seedUsers();
        await seedPosts();
        // await seedComments();
        
        console.log('✅ Seeding completado');
        // process.exit(0);
    } catch (error) {
        console.error('❌ Error en seeding:', error);
        // process.exit(1);
    }
}

/* / Ejecutar solo si se llama directamente
if (require.main === module) {
    runSeed();
} */

module.exports = { readCSV, runSeed };