const User = require('../models/User');
const sequelize = require('../../core/config/db');

/**
 * Servicio encargado de la lógica de negocio para la entidad Usuario.
 * Se utilizan métodos estáticos para no requerir la instanciación de la clase.
 */
class UserService {
    
    /**
     * Recupera todos los usuarios de la base de datos.
     * @returns {Promise<Array>} Lista de usuarios.
     */
    static async getAllUsers() {
        // En una app real, aquí podrías aplicar filtros o paginación
        return await User.findAll();
    }

    /**
     * Crea un nuevo usuario.
     * @param {Object} userData - Objeto con los datos del usuario (firstName, lastName, email).
     * @returns {Promise<Object>} El usuario creado.
     */
    static async createUser(userData) {
        /**
         * Lógica de negocio adicional:
         * Podrías verificar si el email ya existe manualmente antes de intentar insertar,
         * aunque Sequelize ya lo hace por el constraint 'unique: true'.
         */
        return await User.create(userData);
    }

    /**
     * Busca un usuario por su ID.
     * @param {number} id - Identificador único.
     * @returns {Promise<Object|null>}
     */
    static async getUserById(id) {
        return await User.findByPk(id);
    }


    /**
     * Actualiza un usuario. Sirve para PUT y PATCH.
     * @param {number} id - ID del usuario.
     * @param {Object} updateData - Datos a modificar.
     * @returns {Promise<Object|null>} El usuario actualizado.
     */
    static async updateUser(id, updateData) {
        const user = await User.findByPk(id);
        if (!user) return null;

        // update() solo modifica los campos presentes en updateData
        return await user.update(updateData);
    }


    /**
     * Elimina un usuario de la base de datos.
     * @param {number} id 
     * @returns {Promise<boolean>} True si fue eliminado, false si no existía.
     */
    static async deleteUser(id) {
        const user = await User.findByPk(id);
        if (!user) return false;

        await user.destroy();
        return true;
    }
}

module.exports = UserService;