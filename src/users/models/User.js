// Import required tools from the sequelize library
const { Model, DataTypes } = require('sequelize');
// Import the database connection (goes up one level from /models to /src)
const sequelize = require('../../config/db.js');

/**
 * User Model
 * 
 * Represents a user in the system.
 * Extends Sequelize's Model class to inherit all CRUD methods (findAll, create, etc.)
 * Follows the "associate" pattern for handling relationships.
 */
class User extends Model {}

User.init({
    /**
     * 'id' field - OMITTED intentionally
     * Sequelize automatically creates it as:
     * INTEGER PRIMARY KEY AUTO_INCREMENT
     */

    /**
     * firstName Field
     * Maps to 'first_name' column in the database (snake_case)
     */
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,    // NOT NULL constraint - required field
        field: 'first_name'  // Database column name (snake_case)
    },
    
    /**
     * lastName Field
     * Maps to 'last_name' column in the database
     */
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,     // Optional field
        field: 'last_name'   // Database column name (snake_case)
    },
    
    /**
     * email Field
     * Must be unique across all users
     * Includes built-in validation to ensure email format
     */
    email: {
        type: DataTypes.STRING,
        allowNull: false,    // NOT NULL - required field
        unique: true,        // Creates UNIQUE index in database
        validate: {          
            isEmail: true    // Sequelize validation - rejects non-email formats
        }
    },

    /**
     * birthDate Field
     * Maps to 'birth_date' column in the database (snake_case)
     * Uses DATE type (stores year-month-day)
     */
    birthDate: {
        type: DataTypes.DATEONLY,  // Solo fecha, sin hora (YYYY-MM-DD)
        allowNull: true,            // Puede ser null si no se provee
        field: 'birth_date'         // Database column name (snake_case)
    }
}, { 
    sequelize,              // Database connection instance
    modelName: 'user',      // Internal model name (table becomes 'users' - pluralized automatically)
    timestamps: true,       // Automatically adds 'createdAt' and 'updatedAt' columns
    underscored: true       // Converts camelCase to snake_case: createdAt -> created_at
});

/**
 * Define associations for the User model.
 * 
 * This function is called automatically by the global model registry.
 * It receives all loaded models as a parameter to wire up relationships
 * without creating circular dependencies.
 * 
 * @param {Object} models - All registered models from src/models/index.js
 */
User.associate = (models) => {
    /**
     * User -> Posts (One-to-Many)
     * A User can have many Posts.
     * 
     * Adds methods to User instance:
     * - user.getPosts()
     * - user.addPost()
     * - user.removePost()
     * - user.countPosts()
     */
    User.hasMany(models.Post, {
        foreignKey: 'authorId',  // Foreign key in the Post model
        as: 'posts'              // Alias: user.getPosts() instead of user.getPosts()
    });

    /**
     * User -> Comments (One-to-Many)
     * A User can have many Comments.
     * 
     * Adds methods to User instance:
     * - user.getComments()
     * - user.addComment()
     * - user.removeComment()
     */
    User.hasMany(models.Comment, {
        foreignKey: 'userId',    // Foreign key in the Comment model
        as: 'comments'           // Alias: user.getComments()
    });
};

// Export the model for use in other files
module.exports = User;