const express = require('express');
const router = express.Router();
const PostController = require('../controllers/postController');

// Definición de rutas apuntando a los métodos estáticos
// ... importaciones
router.get('/', PostController.getPosts);
// El ":id" es un comodín que recibirá el valor (ej: /api/v1/posts/5)
router.get('/:id', PostController.getPostById);

router.post('/', PostController.create);

// Nuevas rutas con parámetros :id
router.put('/:id', PostController.update);   // Reemplazo total
router.patch('/:id', PostController.update); // Actualización parcial
router.delete('/:id', PostController.delete);

module.exports = router;
