const express = require('express');
const router = express.Router();
const adoptionController = require('../controllers/adoptionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas de adoção requerem autenticação
router.use(authMiddleware);

// POST /api/adocoes/:id_pet - Solicitar adoção de um pet
router.post('/:id_pet', adoptionController.requestAdoption);

// GET /api/adocoes/minhas-solicitacoes - Listar solicitações de adoção feitas pelo usuário logado
router.get('/minhas-solicitacoes', adoptionController.listMyRequests);

// GET /api/adocoes/solicitacoes-recebidas - Listar solicitações de adoção recebidas para os pets do usuário logado
router.get('/solicitacoes-recebidas', adoptionController.listReceivedRequests);

// PUT /api/adocoes/:id_adocao/status - Atualizar o status de uma solicitação de adoção (Aceita/Recusada)
router.put('/:id_adocao/status', adoptionController.updateAdoptionStatus);

module.exports = router;
