const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas de mensagens requerem autenticação
router.use(authMiddleware);

// POST /api/mensagens - Enviar nova mensagem
router.post('/', messageController.sendMessage);

// GET /api/mensagens/conversas - Listar todas as conversas do usuário logado
router.get('/conversas', messageController.listConversations);

// GET /api/mensagens/:id_usuario - Listar mensagens de uma conversa específica
router.get('/:id_usuario', messageController.getConversationMessages);

module.exports = router;
