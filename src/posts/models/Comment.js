const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.js');

/**
 * Comment Model
 * 
 * Represents a comment made by a User on a specific Post.
 * This model follows the "associate" pattern to handle relationships
 * without circular dependency issues.
 */
const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    /**
     * Foreign Key: User (userId)
     * Cannot be null - every comment must have an author (User)
     */
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'          // Maps to 'user_id' column in database
    },
    /**
     * Foreign Key: Post (postId)
     * Cannot be null - every comment must belong to a Post
     */
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'post_id'          // Maps to 'post_id' column in database
    }
}, {
    tableName: 'comments',        // Explicit table name
    timestamps: true,             // Adds createdAt and updatedAt automatically
    underscored: true             // Converts camelCase to snake_case: createdAt -> created_at
});

/**
 * Define associations for the Comment model.
 * 
 * This function is called automatically by the global model registry.
 * It receives all loaded models as a parameter to wire up relationships.
 * 
 * @param {Object} models - All registered models from src/models/index.js
 */
Comment.associate = (models) => {
    // Comment belongs to a User (N:1 relationship)
    // Adds methods: comment.getAuthor(), comment.setAuthor()
    Comment.belongsTo(models.User, {
        foreignKey: 'userId',     // Foreign key in comments table
        as: 'author'              // Alias: comment.author gives the User
    });

    // Comment belongs to a Post (N:1 relationship)
    // Adds methods: comment.getPost(), comment.setPost()
    Comment.belongsTo(models.Post, {
        foreignKey: 'postId',     // Foreign key in comments table
        as: 'post'                // Alias: comment.post gives the Post
    });
};

module.exports = Comment;