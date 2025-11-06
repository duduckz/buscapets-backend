const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rota de Cadastro de Usuário
router.post('/cadastro', userController.registerUser);

// Rota de Login
router.post('/login', userController.loginUser);

// Rota para obter o perfil do usuário (protegida)
router.get('/perfil', authMiddleware, userController.getUserProfile);

// Rota para atualizar o perfil do usuário (protegida)
router.put('/perfil', authMiddleware, userController.updateUserProfile);

// Rota para excluir o usuário (protegida)
router.delete('/perfil', authMiddleware, userController.deleteUser);

module.exports = router;
