const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// Definición de rutas apuntando a los métodos estáticos
// ... importaciones
router.get('/', UserController.getUsers);
// El ":id" es un comodín que recibirá el valor (ej: /api/v1/users/5)
router.get('/:id', UserController.getUserById);

router.post('/', UserController.create);

// Nuevas rutas con parámetros :id
router.put('/:id', UserController.update);   // Reemplazo total
router.patch('/:id', UserController.update); // Actualización parcial
router.delete('/:id', UserController.delete);

module.exports = router;

module.exports = router;