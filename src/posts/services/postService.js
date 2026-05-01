const Post = require('../models/Post');

const sequelize = require('../../config/db.js'); 

const UserService = require('../../users/services/userService.js');


/**
 * Servicio encargado de la lógica de negocio para la entidad Post.
 * Se utilizan métodos estáticos para no requerir la instanciación de la clase.
 */
class PostService {
    
    /**
     * Recupera todos los posts de la base de datos.
     * @returns {Promise<Array>} Lista de posts.
     */
    static async getAllPosts() {
        // En una app real, aquí podrías aplicar filtros o paginación
        return await Post.findAll();
    }

    /**
     * Crea un nuevo post.
     * @param {Object} postData - Objeto con los datos del post (title, content, userId, etc.).
     * @returns {Promise<Object>} El post creado.
     */
    static async createPost(postData) {
        /**
         * Lógica de negocio adicional:
         * Podrías verificar validaciones antes de insertar,
         * aunque Sequelize ya lo hace con las validaciones del modelo.
         */

        // el author_id asociado siempre va a existir porque no verificamos que exista
        const author = await UserService.getUserById(postData.authorId);

        if (!author) {
            throw new Error('el autor no existe');
        }

        return await Post.create(postData);
    }

    /**
     * Busca un post por su ID.
     * @param {number} id - Identificador único.
     * @returns {Promise<Object|null>}
     */
    static async getPostById(id) {
        return await Post.findByPk(id);
    }


    /**
     * Actualiza un post. Sirve para PUT y PATCH.
     * @param {number} id - ID del post.
     * @param {Object} updateData - Datos a modificar.
     * @returns {Promise<Object|null>} El post actualizado.
     */
    static async updatePost(id, updateData) {
        const post = await Post.findByPk(id);
        if (!post) return null;

        // update() solo modifica los campos presentes en updateData
        return await post.update(updateData);
    }


    /**
     * Elimina un post de la base de datos.
     * @param {number} id 
     * @returns {Promise<boolean>} True si fue eliminado, false si no existía.
     */
    static async deletePost(id) {
        const post = await Post.findByPk(id);
        if (!post) return false;

        await post.destroy();
        return true;
    }
}

module.exports = PostService;
