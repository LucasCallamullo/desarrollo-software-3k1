const sequelize = require('./config/db.js'); 
const cors = require('cors'); // 1. Importar cors
const express = require('express');

// Importamos 'sequelize' y los modelos ya asociados desde el index de la carpeta models
const { Degree, Subject, Commission, Course } = require('./subjects/models');


// Importamos los modelos para que Sequelize los reconozca antes de sincronizar
const UserService = require('./users/services/userService.js');

// Importamos las rutas para usuarios y posts
const userRoutes = require('./users/routes/userRoutes.js'); 
const postRoutes = require('./posts/routes/postRoutes');

const app = express();
// http://localhost:3000
const PORT = 3000;


// 2. Configurar CORS (El '*' es el default si no pasas opciones)
// Esto permite que CUALQUIER origen acceda a tu API
app.use(cors());

// Middleware para que Express entienda JSON (muy importante para POST/PUT)
app.use(express.json());

// Vinculamos las rutas. 
// Todos los endpoints en userRoutes tendrán el prefijo /users
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);

async function startServer() {
    try {
        // Conectamos y sincronizamos DB
        await sequelize.authenticate();
        /**
         * --- ESTRATEGIAS DE SINCRONIZACIÓN DE BASE DE DATOS ---
         */

        // Opción 1: Solo crea si no existe (Producción)
        // await sequelize.sync(); 

        // Opción 2: Recreación total (Desarrollo inicial / Reset)
        // ¡CUIDADO! Ejecuta "DROP TABLE", borrando todos los registros antes de crear.
        // await sequelize.sync({ force: true }); 

        // Opción 3: Alteración inteligente (Desarrollo activo)
        // Compara el modelo con la DB y añade columnas nuevas sin borrar los datos existentes.
        await sequelize.sync({ alter: true }); 

        console.log('✅ DB Conectada y Sincronizada');

        // para crear datos fake
        UserService.seed();

        // Iniciamos el servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar:', error);
    }
}

startServer();


/* 
// 3. Prueba rápida: Crear un usuario y un post
const nuevoUsuario = await User.create({
    firstName: "Lucas",
    lastName: "Callamullo",
    email: "lucas@ejemplo.com"
});

await Post.create({
    text: "Mi primer post en Sequelize",
    authorId: nuevoUsuario.id // Usamos el ID del usuario recién creado
}); **/