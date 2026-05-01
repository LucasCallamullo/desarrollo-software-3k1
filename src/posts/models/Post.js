const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/db.js'); 

// Importamos User para crear la relación.
// aunque supongo que esto debera ir a ese index js pero de esta app models? 

// ejemplo yo aca quiero que tenga tambien desde subject y commission_id
const User = require('../../users/models/User.js'); 

class Post extends Model {}

Post.init({
    // 'id': Creado automáticamente por Sequelize.
    text: {
        type: DataTypes.STRING,
        // En Django, blank=True permite strings vacíos ("").
        // En Sequelize, allowNull: false obliga a que el campo exista, 
        // pero permite que sea un string vacío "" a menos que agregues una validación.
        allowNull: false 
    }
}, { 
    sequelize, 
    modelName: 'post', // Nombre de la tabla en SQL será 'posts'.
    timestamps: true,   // Crea automáticamente las columnas 'createdAt' y 'updatedAt'.
    underscored: true // Convierte createdAt -> created_at automáticamente
});


/**
 * RELACIONES
 * Importante: Definir la relación no obliga a que sea Eager o Lazy.
 * Eso lo decidís vos al momento de hacer el User.findOne() o Post.findAll().
 */

// User.hasMany: Relación 1 a N.
// Agrega métodos al objeto User como: user.getPosts(), user.addPost(), etc.
User.hasMany(Post, { 
    foreignKey: { name: 'authorId', field: 'author_id' }, 
    as: 'posts'  // Alias: Cuando hagas user.getPosts() o uses include: ['posts'].
});

// Post.belongsTo: Relación N a 1.
// Agrega métodos al objeto Post como: post.getAutor(), post.setAutor().
Post.belongsTo(User, { 
    foreignKey: { name: 'authorId', field: 'author_id' }, 
    as: 'author'  // ¿Qué es esto? Es el alias para acceder al objeto padre.
                // Te permite hacer: post.autor.firstName para ver quién lo escribió.
});

/**
 * --- EJEMPLO DE USO (Para tu app.js o lógica de negocio) ---
 * * 1. EAGER LOADING (Carga de una):
 * const usuarioConPosts = await User.findByPk(1, { include: 'posts' });
 * console.log(usuarioConPosts.posts); // Ya están acá, no hace falta otra consulta.
 * * 2. LAZY LOADING (Carga bajo demanda):
 * const usuario = await User.findByPk(1); 
 * const susPosts = await usuario.getPosts(); // Recién acá hace la consulta a la tabla posts.
 */


module.exports = Post;