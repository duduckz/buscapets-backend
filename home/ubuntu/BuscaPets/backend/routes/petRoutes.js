const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // Middleware para upload de imagens

// Rotas Protegidas (Requerem autenticação)
// POST /api/pets - Cadastrar novo pet (com upload de imagem)
router.post('/', authMiddleware, upload.single('foto_pet'), petController.createPet);

// PUT /api/pets/:id - Atualizar pet (com upload de imagem opcional)
router.put('/:id', authMiddleware, upload.single('foto_pet'), petController.updatePet);

// DELETE /api/pets/:id - Excluir pet
router.delete('/:id', authMiddleware, petController.deletePet);

// Rotas Públicas
// GET /api/pets - Listar todos os pets (com filtros)
router.get('/', petController.getAllPets);

// GET /api/pets/:id - Obter detalhes de um pet específico
router.get('/:id', petController.getPetById);

module.exports = router;
