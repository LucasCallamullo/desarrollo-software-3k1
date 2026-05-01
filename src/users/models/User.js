// Importamos las herramientas necesarias de la librería sequelize
const { Model, DataTypes } = require('sequelize');
// Importamos la conexión a la base de datos (sube un nivel desde /models a /src)
const sequelize = require('../../config/db.js'); 

/**
 * Definimos la clase User que extiende de Model.
 * Esto le da a nuestra clase todos los métodos de Sequelize (findAll, create, etc.)
 */
class User extends Model {}

User.init({
    // 'id': No se escribe. Sequelize lo genera solo como INTEGER PRIMARY KEY AUTOINCREMENT.

    firstName: {
        type: DataTypes.STRING,
        allowNull: false, // NOT NULL en SQL. Obligatorio.
        field: 'first_name' // Mapeo: en JS es firstName, en la tabla es first_name.
    },
    lastName: {
        type: DataTypes.STRING,
        field: 'last_name' // Mapeo para mantener el estándar snake_case en SQL.
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false, // Obligatorio.
        unique: true,    // Crea un índice único en la DB (no se pueden repetir emails).
        validate: {      
            isEmail: true // Validación de Sequelize: si no tiene formato de mail, no guarda.
        }
    }
}, { 
    sequelize,         // Pasamos la instancia de conexión.
    modelName: 'user', // Define el nombre interno del modelo. Sequelize por defecto pluraliza (tabla: 'users').
    timestamps: true,   // Crea automáticamente las columnas 'createdAt' y 'updatedAt'.
    // Definís el nombre de la columna física para cada uno
    underscored: true // Convierte createdAt -> created_at automáticamente
});

// Exportamos el modelo para usarlo en otros archivos.
module.exports = User;