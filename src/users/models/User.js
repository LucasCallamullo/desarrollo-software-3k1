/**
 * ================================================================
 * USER MODEL
 * ================================================================
 * 
 * This model represents a user account in the system.
 * 
 * Table: users_users (custom name to avoid conflicts)
 * 
 * Features:
 *   - Auto-incremented primary key (implicit)
 *   - Timestamps (created_at, updated_at) automatically added
 *   - Password hashing via bcrypt hooks (beforeCreate, beforeUpdate)
 *   - Built-in email validation
 *   - Role-based access control (user, admin)
 *   - Association pattern to avoid circular dependencies
 * 
 * Relationships:
 *   - Has many Posts (as author)
 *   - Has many Comments (as author)
 * 
 * Security:
 *   - Passwords are never stored in plain text
 *   - Bcrypt salt rounds: 12 (secure balance between speed and security)
 *   - Passwords re-hashed only when changed (beforeUpdate hook)
 * 
 * ================================================================
 */

// Import required tools from the sequelize library
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

// Import the database connection
const sequelize = require('../../core/config/db');

/**
 * User Model
 * 
 * Represents a registered user in the forum system.
 * Uses Sequelize's Model class inheritance for full CRUD capabilities.
 */
class User extends Model {}

User.init({
    /**
     * Primary key - auto-incremented integer
     * 
     * Note: This field is OMITTED intentionally in the init() call
     * because Sequelize automatically adds an 'id' field with:
     *   - INTEGER PRIMARY KEY
     *   - AUTO_INCREMENT
     *   - NOT NULL
     * 
     * This is the default behavior unless overridden.
     */

    /**
     * First Name Field
     * Maps to 'first_name' column in the database (snake_case conversion)
     * 
     * Required field - every user must have a first name.
     * Database constraint: NOT NULL
     */
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,    // NOT NULL constraint - required field
    },
    
    /**
     * Last Name Field
     * Maps to 'last_name' column in the database
     * 
     * Optional field - users may not provide a last name.
     * Database constraint: NULL allowed
     */
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,     // Optional field
        field: 'last_name'   // Database column name (snake_case)
    },
    
    /**
     * Email Field
     * Maps to 'email' column in the database
     * 
     * Required field - used for login and notifications.
     * Must be unique across all users (UNIQUE index in database).
     * 
     * Validation:
     *   - Built-in isEmail validator ensures proper email format
     *   - Prevents invalid emails like "notanemail" or "missing@domain"
     */
    email: {
        type: DataTypes.STRING,
        allowNull: false,        // NOT NULL - required
        unique: true,            // UNIQUE constraint - no duplicate emails
        validate: {
            isEmail: true        // Validates email format (e.g., user@domain.com)
        }
    },

    /**
     * Password Field
     * Maps to 'password' column in the database
     * 
     * Required field - stored as a hashed value, never plain text.
     * 
     * Security:
     *   - Hashed using bcrypt with salt rounds = 12
     *   - Original password is never persisted
     *   - Cannot be retrieved after hashing (one-way encryption)
     */
    password: {
        type: DataTypes.STRING,
        allowNull: false         // Every user needs a password
    },
    
    /**
     * Role Field
     * Maps to 'role' column in the database
     * 
     * Defines user permissions and access levels.
     * 
     * Available roles:
     *   - 'user'  : Regular user with standard permissions
     *   - 'admin' : Administrator with elevated privileges
     */
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user',    // Default value: 'user' (new users are regular users by default)
        validate: {
            isIn: [['user', 'admin']]  // Only these two roles are allowed
        }
    },

    /**
     * Birth Date Field
     * Maps to 'birth_date' column in the database
     * 
     * Optional field - users may choose not to provide birth date.
     * 
     * Data type: DATEONLY (stores year-month-day, no time component)
     * Example values: '1990-05-15', '1985-12-03'
     */
    birthDate: {
        type: DataTypes.DATEONLY,  // Solo fecha, sin hora (YYYY-MM-DD)
        allowNull: true,            // Puede ser null si no se provee
        field: 'birth_date'         // Database column name (snake_case)
    }
}, { 
    sequelize,                      // Database connection instance
    modelName: 'users_users',       // Internal model name
    tableName: 'users_users',       // Explicit table name (pluralized automatically if omitted)
    timestamps: true,               // Adds 'created_at' and 'updated_at' columns automatically
    underscored: true,              // Converts camelCase to snake_case: createdAt → created_at

    // ============================================================
    // SEQUELIZE HOOKS (Lifecycle events)
    // ============================================================
    hooks: {
        /**
         * beforeCreate Hook
         * Executes automatically before a new user is saved to the database.
         * 
         * Purpose: Hash the password before storing it.
         * 
         * Why this is important:
         *   - NEVER store plain text passwords (security risk)
         *   - bcrypt hashing is one-way (can't be reversed)
         *   - Salt rounds = 12 (good balance of security vs performance)
         * 
         * @param {Object} user - The user instance being created
         */
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(12);           // Generate random salt
                user.password = await bcrypt.hash(user.password, salt);  // Hash password
            }
        },
        
        /**
         * beforeUpdate Hook
         * Executes automatically before an existing user is updated.
         * 
         * Purpose: Re-hash password ONLY if it has changed.
         * 
         * Optimization: Uses user.changed('password') to detect if the password field
         * was modified. This prevents unnecessary re-hashing of unchanged passwords.
         * 
         * @param {Object} user - The user instance being updated
         */
        beforeUpdate: async (user) => {
            // Only hash if the password field was actually changed
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(12);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

/**
 * Define associations for the User model.
 * 
 * This function is called automatically by the global model registry
 * (core/models/index.js) after all models are loaded.
 * 
 * It receives all loaded models as a parameter to wire up relationships
 * without creating circular dependencies (e.g., User imports Post,
 * Post imports User, causing a loop).
 * 
 * @param {Object} models - All registered models from src/models/index.js
 *                          Contains references to Post, Comment, Subject, etc.
 */
User.associate = (models) => {
    /**
     * User -> Posts (One-to-Many relationship)
     * Type: 1:N (One user can have many posts)
     * 
     * A user can write multiple forum posts.
     * When a user is deleted, all their posts are also deleted (CASCADE).
     * 
     * Database:
     *   - Foreign key: posts.author_id REFERENCES users_users.id
     *   - ON DELETE: CASCADE (delete user → delete their posts)
     *   - ON UPDATE: CASCADE (if user.id changes, update posts.author_id)
     */
    User.hasMany(models.Post, {
        foreignKey: 'authorId',     // Column in Post table that references User
        as: 'posts',                // Alias: user.getPosts() instead of user.getPosts()
        onDelete: 'CASCADE',        // Delete posts when user is deleted
        onUpdate: 'CASCADE'         // Update foreign key if user.id changes
    });

    /**
     * User -> Comments (One-to-Many relationship)
     * Type: 1:N (One user can have many comments)
     * 
     * A user can post multiple comments on forum posts.
     * When a user is deleted, all their comments are also deleted (CASCADE).
     * 
     * Database:
     *   - Foreign key: comments.author_id REFERENCES users_users.id
     *   - ON DELETE: CASCADE (delete user → delete their comments)
     *   - ON UPDATE: CASCADE (if user.id changes, update comments.author_id)
     */
    User.hasMany(models.Comment, {
        foreignKey: 'authorId',     // Column in Comment table that references User
        as: 'comments',             // Alias: user.getComments()
        onDelete: 'CASCADE',        // Delete comments when user is deleted
        onUpdate: 'CASCADE'         // Update foreign key if user.id changes
    });
};

// Export the model for use in other files
module.exports = User;