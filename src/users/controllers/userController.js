const UserService = require('../services/userService');

/**
 * Controlador para la entidad Usuario.
 * Se encarga de recibir las peticiones HTTP, comunicarse con el servicio
 * y enviar la respuesta correspondiente al cliente.
 */
class UserController {

    /**
     * Maneja la petición para obtener todos los usuarios.
     * @param {import('express').Request} req 
     * @param {import('express').Response} res 
     */
    // rate_limit de 30 peticiones por minuto
    static async getUsers(req, res) {
        try {
            // Delegamos la lógica de obtención de datos al servicio
            const users = await UserService.getAllUsers();
            
            // Retornamos la lista con status 200 (OK)
            res.status(200).json(users);
        } catch (error) {
            // Errores de servidor o base de datos caen aquí
            res.status(500).json({ error: 'Error interno en el servidor' });
        }
    }

    /**
     * Obtiene un usuario específico por su ID.
     */
    static async getUserById(req, res) {
        try {
            // req.params contiene los parámetros de la URL
            const { id } = req.params; 
            
            const user = await UserService.getUserById(id);
            
            if (!user) {
                // Si el servicio devuelve null, respondemos con 404
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Error al buscar el usuario' });
        }
    }

    /**
     * Maneja POST la petición para crear un nuevo usuario.
     * @param {import('express').Request} req 
     * @param {import('express').Response} res 
     */
    static async create(req, res) {
        try {
            /**
             * Enviamos el cuerpo de la petición (JSON) al servicio.
             * req.body debe mapear con los campos del modelo: firstName, lastName, email.
             */
            const newUser = await UserService.createUser(req.body);

            // Retornamos el recurso creado con status 201 (Created)
            res.status(201).json(newUser);
        } catch (error) {
            /**
             * Errores de validación (ej: email duplicado) caen aquí.
             * Retornamos status 400 (Bad Request).
             */
            res.status(400).json({ error: error.message });
        }
    }


    /**
     * Maneja PUT/PATCH /users/:id
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedUser = await UserService.updateUser(id, req.body);

            if (!updatedUser) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.status(200).json(updatedUser);

        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Maneja DELETE /users/:id
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await UserService.deleteUser(id);

            if (!deleted) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // 204 No Content es el estándar para deletes exitosos sin cuerpo de respuesta
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar usuario' });
        }
    }
}

module.exports = UserController;