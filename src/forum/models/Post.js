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
 * ================================================================
 * MODEL ASSOCIATIONS
 * ================================================================
 * 
 * Defines all relationships for the Post model.
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

Post.associate = (models) => {
    
    // ============================================================
    // RELATION 1: Post → User (author)
    // ============================================================
    /**
     * Post belongs to a User (author)
     * Type: Many-to-One (N:1)
     * 
     * The foreign key 'authorId' references 'id' in the User model
     * 
     * Adds to Post instance:
     *   - post.getAuthor()        → returns the User who wrote the post
     *   - post.setAuthor()        → sets the author
     *   - post.createAuthor()     → creates and associates a new author
     * 
     * Query usage:
     *   await Post.findByPk(1, { include: ['author'] })
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

    // ============================================================
    // RELATION 2: Post → Subject (optional)
    // ============================================================
    /**
     * Post belongs to a Subject (optional)
     * Type: Many-to-One (N:1) - optional foreign key
     * 
     * The foreign key 'subjectId' can be NULL (post may not be subject-specific)
     * 
     * Adds to Post instance:
     *   - post.getSubject()       → returns the Subject (or null)
     *   - post.setSubject()       → sets the subject (or null)
     *   - post.createSubject()    → creates and associates a new subject
     * 
     * Query usage:
     *   await Post.findAll({ include: ['subject'] })
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

    // ============================================================
    // RELATION 3: Post → Commission (optional)
    // ============================================================
    /**
     * Post belongs to a Commission (optional)
     * Type: Many-to-One (N:1) - optional foreign key
     * 
     * The foreign key 'commissionId' can be NULL (post may not be commission-specific)
     * 
     * Adds to Post instance:
     *   - post.getCommission()    → returns the Commission (or null)
     *   - post.setCommission()    → sets the commission (or null)
     *   - post.createCommission() → creates and associates a new commission
     * 
     * Query usage:
     *   await Post.findAll({ include: ['commission'] })
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

    // ============================================================
    // RELATION 4: Post → Comments
    // ============================================================
    /**
     * Post has many Comments
     * Type: One-to-Many (1:N)
     * 
     * The foreign key 'postId' in the Comment model references this Post
     * 
     * Adds to Post instance:
     *   - post.getComments()      → returns all comments for this post
     *   - post.countComments()    → returns the number of comments
     *   - post.addComment()       → adds a comment
     *   - post.removeComment()    → removes a comment
     *   - post.createComment()    → creates and adds a new comment
     * 
     * Query usage:
     *   await Post.findByPk(1, { include: ['comments'] })
     * 
     * Database:
     *   - comments.post_id REFERENCES posts.id
     *   - ON DELETE: CASCADE (if post is deleted, delete all its comments)
     *   - ON UPDATE: CASCADE (if post.id changes, update post_id)
     * 
     * Model reference: models.Comment (defined in ../Comment.js)
     * 
     * Note: The reverse association is defined in Comment.associate():
     *   Comment.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' })
     */
    Post.hasMany(models.Comment, {
        foreignKey: 'postId',
        as: 'comments',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
};

module.exports = Post;