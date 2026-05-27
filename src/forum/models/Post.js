/**
 * ================================================================
 * POST MODEL
 * ================================================================
 * 
 * This model represents a forum post written by a user.
 * 
 * Table: posts
 * 
 * Features:
 *   - Auto-generated UUID primary key
 *   - Timestamps (created_at, updated_at)
 *   - Soft-delete ready (paranoid can be added)
 *   - Association pattern to avoid circular dependencies
 * 
 * Relationships:
 *   - Belongs to a User (author) - REQUIRED
 *   - Belongs to a Subject (optional) - e.g., AED, DDS
 *   - Belongs to a Commission (optional) - e.g., 1K1, 3K3B
 *   - Has many Comments
 * 
 * ================================================================
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../core/config/db');

/**
 * Post Model
 * 
 * Represents a blog post written by a User.
 * Can optionally be associated with a Subject and/or Commission.
 */
const Post = sequelize.define('Post', {
    /**
     * Primary key - auto-incremented integer
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Post title
     * Required. Must be between 5 and 255 characters.
     */
    title: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Post title cannot be empty' },
            len: { args: [5, 255], msg: 'Title must be between 5 and 255 characters' }
        }
    },

    /**
     * Post content
     * Optional. Supports HTML/Markdown.
     */
    content: {
        type: DataTypes.TEXT,
        allowNull: true
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
     * Subject ID - Foreign key referencing Subject
     * Optional. Null if post is not subject-specific.
     * Column: subject_id (converted by underscored: true)     
     */
    subjectId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    /**
     * Commission ID - Foreign key referencing Commission
     * Optional. Null if post is not commission-specific.
     * Column: commission_id (converted by underscored: true)
     */
    commissionId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'forum_posts',    // appName_modelName's
    timestamps: true,           // Adds created_at and updated_at
    underscored: true           // Converts camelCase to snake_case
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
Post.associate = (models) => {
    
    /**
     * Post belongs to a User (author)
     * Type: Many-to-One (N:1)
     * 
     * The foreign key 'authorId' references 'id' in the User model
     * 
     * Database:
     *   - posts.author_id REFERENCES users.id
     *   - ON DELETE: CASCADE (if user is deleted, delete their posts)
     *   - ON UPDATE: CASCADE (if user.id changes, update author_id)
     * 
     * Model reference: users/models.User (defined in ../User.js)
     */
    Post.belongsTo(models.User, {
        foreignKey: 'authorId',
        as: 'author',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    /**
     * Post belongs to a Subject (optional)
     * Type: Many-to-One (N:1) - optional foreign key
     * 
     * The foreign key 'subjectId' can be NULL (post may not be subject-specific)
     * 
     * Database:
     *   - posts.subject_id REFERENCES subjects.id (nullable)
     *   - ON DELETE: SET NULL (if subject is deleted, set subject_id to NULL)
     *   - ON UPDATE: CASCADE (if subject.id changes, update subject_id)
     * 
     * Model reference: subjects/models.Subject (defined in ../Subject.js)
     */
    Post.belongsTo(models.Subject, {
        foreignKey: 'subjectId',
        as: 'subject',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    });

    /**
     * Post belongs to a Commission (optional)
     * Type: Many-to-One (N:1) - optional foreign key
     * 
     * The foreign key 'commissionId' can be NULL (post may not be commission-specific)
     * 
     * Database:
     *   - posts.commission_id REFERENCES commissions.id (nullable)
     *   - ON DELETE: SET NULL (if commission is deleted, set commission_id to NULL)
     *   - ON UPDATE: CASCADE (if commission.id changes, update commission_id)
     * 
     * Model reference: subjects/models.Commission (defined in ../Commission.js)
     */
    Post.belongsTo(models.Commission, {
        foreignKey: 'commissionId',
        as: 'commission',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    });

    /**
     * Post has many Comments
     * Type: One-to-Many (1:N)
     * 
     * The foreign key 'postId' in the Comment model references this Post
     * 
     * Database:
     *   - comments.post_id REFERENCES posts.id
     *   - ON DELETE: CASCADE (if post is deleted, delete all its comments)
     *   - ON UPDATE: CASCADE (if post.id changes, update post_id)
     * 
     * Model reference: models.Comment (defined in ../Comment.js)
     */
    Post.hasMany(models.Comment, {
        foreignKey: 'postId',
        as: 'comments',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
};

module.exports = Post;