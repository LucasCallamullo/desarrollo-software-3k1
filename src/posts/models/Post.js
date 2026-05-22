const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.js');

/**
 * Post Model
 * 
 * Represents a blog post written by a User.
 * Can optionally be associated with a Subject and/or Commission.
 */
const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    /**
     * Foreign Key: User (author)
     * Cannot be null - every post must have an author
     */
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'author_id'
    },
    /**
     * Foreign Key: Subject (optional)
     * A post can be related to a specific subject (e.g., AED, DDS)
     * Can be null because a post might be general
     */
    subjectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'subject_id'
    },
    /**
     * Foreign Key: Commission (optional)
     * A post can be related to a specific commission (e.g., Commission 1)
     * Can be null because a post might be general or subject-wide
     */
    commissionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'commission_id'
    }
}, {
    tableName: 'posts',
    timestamps: true,
    underscored: true  // created_at, updated_at
});

/**
 * Define associations for the Post model.
 * 
 * This follows the "associate" pattern to avoid circular dependencies.
 * All relationships are defined here, not directly in the model file.
 * 
 * @param {Object} models - All registered models from the global registry
 */
Post.associate = (models) => {
    // Post belongs to a User (author) - REQUIRED
    Post.belongsTo(models.User, {
        foreignKey: 'authorId',
        as: 'author'
    });

    // Post belongs to a Subject (optional) - a post can be about a subject
    Post.belongsTo(models.Subject, {
        foreignKey: 'subjectId',
        as: 'subject'
    });

    // Post belongs to a Commission (optional) - specific to a commission
    Post.belongsTo(models.Commission, {
        foreignKey: 'commissionId',
        as: 'commission'
    });

    // Post has many Comments
    Post.hasMany(models.Comment, {
        foreignKey: 'postId',
        as: 'comments'
    });
};

module.exports = Post;