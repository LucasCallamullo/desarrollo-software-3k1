const PostService = require('../services/postService');

/**
 * Controlador para la entidad Post.
 * Se encarga de recibir las peticiones HTTP, comunicarse con el servicio
 * y enviar la respuesta correspondiente al cliente.
 */
class PostController {

    /**
     * Maneja la petición para obtener todos los posts.
     * @param {import('express').Request} req 
     * @param {import('express').Response} res 
     */
    static async getPosts(req, res) {
        try {
            // Delegamos la lógica de obtención de datos al servicio
            const posts = await PostService.getAllPosts();
            
            // Retornamos la lista con status 200 (OK)
            res.status(200).json(posts);
        } catch (error) {
            // Errores de servidor o base de datos caen aquí
            res.status(500).json({ error: 'Error interno en el servidor' });
        }
    }

    /**
     * Obtiene un post específico por su ID.
     */
    static async getPostById(req, res) {
        try {
            // req.params contiene los parámetros de la URL
            const { id } = req.params; 
            
            const post = await PostService.getPostById(id);
            
            if (!post) {
                // Si el servicio devuelve null, respondemos con 404
                return res.status(404).json({ error: 'Post no encontrado' });
            }

            res.status(200).json(post);
        } catch (error) {
            res.status(500).json({ error: 'Error al buscar el post' });
        }
    }

    /**
     * Maneja POST la petición para crear un nuevo post.
     * @param {import('express').Request} req 
     * @param {import('express').Response} res 
     */
    static async create(req, res) {
        try {
            /**
             * Enviamos el cuerpo de la petición (JSON) al servicio.
             * req.body debe mapear con los campos del modelo: title, content, userId, etc.
             */
            const newPost = await PostService.createPost(req.body);

            // Retornamos el recurso creado con status 201 (Created)
            res.status(201).json(newPost);
        } catch (error) {
            /**
             * Errores de validación caen aquí.
             * Retornamos status 400 (Bad Request).
             */
            res.status(400).json({ error: error.message });
        }
    }


    /**
     * Maneja PUT/PATCH /posts/:id
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedPost = await PostService.updatePost(id, req.body);

            if (!updatedPost) {
                return res.status(404).json({ error: 'Post no encontrado' });
            }

            res.status(200).json(updatedPost);

        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Maneja DELETE /posts/:id
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await PostService.deletePost(id);

            if (!deleted) {
                return res.status(404).json({ error: 'Post no encontrado' });
            }

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el post' });
        }
    }
}

module.exports = PostController;
