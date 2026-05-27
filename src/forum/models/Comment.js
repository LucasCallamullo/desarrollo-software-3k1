const { DataTypes } = require('sequelize');
const sequelize = require('../../core/config/db');

/**
 * Comment Model
 * 
 * Represents a comment made by a User on a specific Post.
 * Each comment has an author (User) and belongs to a Post.
 */
const Comment = sequelize.define('Comment', {
    /**
     * Primary key - auto-incremented integer
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Comment content
     * Required. The actual text of the comment.
     * Supports HTML/Markdown from frontend.
     */
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Comment content cannot be empty' }
        }
    },

    /**
     * Author ID - Foreign key referencing User
     * Required. Every post must have an author.
     * Column: author_id (converted by underscored: true)        
     */
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    
    /**
     * Post ID - Foreign key referencing Post
     * Required. Every comment must belong to a Post.
     * Column: post_id (converted by underscored: true)
     */
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'forum_comments',    // appName_modelName's
    timestamps: true,           // Adds created_at and updated_at
    underscored: true           // Converts camelCase to snake_case
});

/**
 * ================================================================
 * MODEL ASSOCIATIONS
 * ================================================================
 * 
 * Defines all relationships for the Comment model.
 * 
 * This follows the "associate pattern" to avoid circular dependencies:
 *   1. All models are loaded first (without associations)
 *   2. Then this function is called for each model
 *   3. Associations are registered with the loaded models
 * 
 * The associate function is called automatically by the global model registry.
 * 
 * @param {Object} models - All registered models from the global registry
 *        (index.js in the models folder)
 * 
 * @example
 * // In models/index.js:
 * Object.keys(models).forEach(modelName => {
 *     if (models[modelName].associate) {
 *         models[modelName].associate(models);
 *     }
 * });
 * 
 * ================================================================
 */

Comment.associate = (models) => {
    
    // ============================================================
    // RELATION 1: Comment → User (author)
    // ============================================================
    /**
     * Comment belongs to a User (author)
     * Type: Many-to-One (N:1)
     * 
     * The foreign key 'authorId' references 'id' in the User model
     * 
     * Adds to Comment instance:
     *   - comment.getAuthor()        → returns the User who wrote the comment
     *   - comment.setAuthor()        → sets the author
     *   - comment.createAuthor()     → creates and associates a new author
     * 
     * Query usage:
     *   await Comment.findByPk(1, { include: ['author'] })
     * 
     * Database:
     *   - comments.author_id REFERENCES users.id
     *   - ON DELETE: CASCADE (if user is deleted, delete their comments)
     *   - ON UPDATE: CASCADE (if user.id changes, update author_id)
     * 
     * Model reference: subjects/models.User (defined in ../User.js)
     */
    Comment.belongsTo(models.User, {
        foreignKey: 'authorId',
        as: 'author',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    // ============================================================
    // RELATION 2: Comment → Post
    // ============================================================
    /**
     * Comment belongs to a Post
     * Type: Many-to-One (N:1)
     * 
     * The foreign key 'postId' references 'id' in the Post model
     * 
     * Adds to Comment instance:
     *   - comment.getPost()          → returns the Post this comment belongs to
     *   - comment.setPost()          → sets the post
     *   - comment.createPost()       → creates and associates a new post
     * 
     * Query usage:
     *   await Comment.findByPk(1, { include: ['post'] })
     * 
     * Database:
     *   - comments.post_id REFERENCES posts.id
     *   - ON DELETE: CASCADE (if post is deleted, delete all its comments)
     *   - ON UPDATE: CASCADE (if post.id changes, update post_id)
     * 
     * Model reference: models.Post (defined in ../Post.js)
     * 
     * Note: The reverse association is defined in Post.associate():
     *   Post.hasMany(models.Comment, { foreignKey: 'postId', as: 'comments' })
     */
    Comment.belongsTo(models.Post, {
        foreignKey: 'postId',
        as: 'post',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
};

module.exports = Comment;