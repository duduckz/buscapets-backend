const pool = require('../config/db');

// [POST] Solicitar adoção de um pet
exports.requestAdoption = async (req, res) => {
    const id_solicitante = req.userId;
    const { id_pet } = req.params;

    try {
        // 1. Verificar se o pet existe e está para adoção
        const [pets] = await pool.query('SELECT id_usuario, status FROM pets WHERE id_pet = ?', [id_pet]);
        if (pets.length === 0) {
            return res.status(404).json({ message: 'Pet não encontrado.' });
        }
        const pet = pets[0];

        if (pet.status !== 'Adoção') {
            return res.status(400).json({ message: 'Este pet não está disponível para adoção.' });
        }

        if (pet.id_usuario === id_solicitante) {
            return res.status(400).json({ message: 'Você não pode solicitar a adoção do seu próprio pet.' });
        }

        // 2. Verificar se já existe uma solicitação pendente para este pet
        const [existing] = await pool.query('SELECT id_adocao FROM adocoes WHERE id_pet = ? AND status = "Pendente"', [id_pet]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Já existe uma solicitação de adoção pendente para este pet.' });
        }

        // 3. Criar a solicitação de adoção
        const [result] = await pool.query(
            'INSERT INTO adocoes (id_pet, id_solicitante, status) VALUES (?, ?, "Pendente")',
            [id_pet, id_solicitante]
        );

        res.status(201).json({ message: 'Solicitação de adoção enviada com sucesso!', id_adocao: result.insertId });

    } catch (error) {
        console.error('Erro ao solicitar adoção:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao solicitar adoção.' });
    }
};

// [GET] Listar solicitações de adoção feitas pelo usuário logado
exports.listMyRequests = async (req, res) => {
    const id_solicitante = req.userId;

    try {
        const [requests] = await pool.query(
            `SELECT a.*, p.nome AS nome_pet, p.foto_pet, u.nome AS nome_dono
             FROM adocoes a
             JOIN pets p ON a.id_pet = p.id_pet
             JOIN usuarios u ON p.id_usuario = u.id_usuario
             WHERE a.id_solicitante = ?
             ORDER BY a.data_solicitacao DESC`,
            [id_solicitante]
        );

        res.status(200).json(requests);

    } catch (error) {
        console.error('Erro ao listar minhas solicitações:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao listar solicitações.' });
    }
};

// [GET] Listar solicitações de adoção recebidas para os pets do usuário logado
exports.listReceivedRequests = async (req, res) => {
    const id_dono = req.userId;

    try {
        const [requests] = await pool.query(
            `SELECT a.*, p.nome AS nome_pet, p.foto_pet, u.nome AS nome_solicitante, u.email AS email_solicitante
             FROM adocoes a
             JOIN pets p ON a.id_pet = p.id_pet
             JOIN usuarios u ON a.id_solicitante = u.id_usuario
             WHERE p.id_usuario = ?
             ORDER BY a.data_solicitacao DESC`,
            [id_dono]
        );

        res.status(200).json(requests);

    } catch (error) {
        console.error('Erro ao listar solicitações recebidas:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao listar solicitações recebidas.' });
    }
};

// [PUT] Atualizar o status de uma solicitação de adoção (Aceita/Recusada)
exports.updateAdoptionStatus = async (req, res) => {
    const id_dono = req.userId;
    const { id_adocao } = req.params;
    const { status } = req.body; // Deve ser 'Aceita' ou 'Recusada'

    if (!['Aceita', 'Recusada'].includes(status)) {
        return res.status(400).json({ message: 'Status inválido. Use "Aceita" ou "Recusada".' });
    }

    try {
        // 1. Verificar se a solicitação existe e se o pet pertence ao usuário logado
        const [adocoes] = await pool.query(
            `SELECT a.id_pet, p.id_usuario
             FROM adocoes a
             JOIN pets p ON a.id_pet = p.id_pet
             WHERE a.id_adocao = ?`,
            [id_adocao]
        );

        if (adocoes.length === 0) {
            return res.status(404).json({ message: 'Solicitação de adoção não encontrada.' });
        }

        const adocao = adocoes[0];

        if (adocao.id_usuario !== id_dono) {
            return res.status(403).json({ message: 'Você não tem permissão para alterar o status desta solicitação.' });
        }

        // 2. Atualizar o status da solicitação
        const [result] = await pool.query(
            'UPDATE adocoes SET status = ? WHERE id_adocao = ?',
            [status, id_adocao]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Não foi possível atualizar o status da solicitação.' });
        }

        // 3. Se a adoção for aceita, atualizar o status do pet para 'Adotado' (opcional, mas recomendado)
        if (status === 'Aceita') {
            await pool.query('UPDATE pets SET status = "Adotado" WHERE id_pet = ?', [adocao.id_pet]);
        }

        res.status(200).json({ message: `Status da solicitação atualizado para ${status}.` });

    } catch (error) {
        console.error('Erro ao atualizar status de adoção:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar status de adoção.' });
    }
};
