const PostService = require('../services/postService');

/**
 * Controller for the Post entity.
 * Handles HTTP requests, communicates with the service layer,
 * and sends responses to the client.
 * 
 * Errors are passed to the global error handler via next(error).
 */
class PostController {

    /**
     * GET /posts - Retrieves all posts
     * @param {import('express').Request} req 
     * @param {import('express').Response} res 
     * @param {import('express').NextFunction} next 
     */
    static async getPosts(req, res, next) {
        try {
            const posts = await PostService.getAllPosts();
            res.status(200).json({
                success: true,
                data: posts
            });
        } catch (error) {
            next(error);  // Pass to global error handler
        }
    }

    /**
     * GET /posts/:id - Retrieves a single post by ID
     */
    static async getPostById(req, res, next) {
        try {
            const { id } = req.params;
            const post = await PostService.getPostById(id);
            
            res.status(200).json({
                success: true,
                data: post
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /posts - Creates a new post
     */
    static async create(req, res, next) {
        try {
            const newPost = await PostService.createPost(req.body);
            
            res.status(201).json({
                success: true,
                data: newPost
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /posts/:id - Updates a post (full update)
     * PATCH /posts/:id - Partially updates a post
     */
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const updatedPost = await PostService.updatePost(id, req.body);
            
            res.status(200).json({
                success: true,
                data: updatedPost
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /posts/:id - Deletes a post
     */
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            await PostService.deletePost(id);
            
            res.status(204).send();  // No content
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PostController;