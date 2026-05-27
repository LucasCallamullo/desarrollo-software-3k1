const Post = require('../models/Post.js');
const sequelize = require('../../core/config/db.js');
const AppError = require('../../core/utils/AppError.js');

const UserService = require('../../users/services/userService.js');

/**
 * Service responsible for business logic for the Post entity.
 * Uses static methods to avoid class instantiation.
 */
class PostService {
    
    /**
     * Retrieves all posts from the database.
     * @returns {Promise<Array>} List of posts.
     */
    static async getAllPosts() {
        return await Post.findAll();
    }

    /**
     * Creates a new post.
     * @param {Object} postData - Post data (title, content, authorId, etc.)
     * @returns {Promise<Object>} The created post.
     * @throws {AppError} If author does not exist.
     */
    static async createPost(postData) {
        // Verify that the author exists
        const author = await UserService.getUserById(postData.authorId);
        
        if (!author) {
            throw new AppError('Author does not exist', 404);
        }
        
        return await Post.create(postData);
    }

    /**
     * Finds a post by its ID.
     * @param {number} id - Unique identifier.
     * @returns {Promise<Object>} The found post.
     * @throws {AppError} If post does not exist (404).
     */
    static async getPostById(id) {
        const post = await Post.findByPk(id);
        
        if (!post) {
            throw new AppError('Post not found', 404);
        }
        
        return post;
    }

    /**
     * Updates a post. Works for both PUT and PATCH.
     * @param {number} id - Post ID.
     * @param {Object} updateData - Data to update.
     * @returns {Promise<Object>} The updated post.
     * @throws {AppError} If post does not exist (404).
     */
    static async updatePost(id, updateData) {
        const post = await this.getPostById(id);  // throws AppError if not found
        return await post.update(updateData);
    }

    /**
     * Deletes a post from the database.
     * @param {number} id - Post ID.
     * @returns {Promise<boolean>} True if deleted.
     * @throws {AppError} If post does not exist (404).
     */
    static async deletePost(id) {
        const post = await this.getPostById(id);  // throws AppError if not found
        await post.destroy();
        return true;
    }
}

module.exports = PostService;