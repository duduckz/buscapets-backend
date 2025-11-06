const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// Função auxiliar para remover arquivo de imagem
const removeImage = (filename) => {
    if (filename) {
        const filePath = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads', filename);
        fs.unlink(filePath, (err) => {
            if (err) console.error('Erro ao deletar arquivo de imagem:', err);
        });
    }
};

// [POST] Cadastrar novo Pet
exports.createPet = async (req, res) => {
    const { nome, especie, raca, idade, sexo, porte, cor, descricao, status, latitude, longitude } = req.body;
    const id_usuario = req.userId; // Obtido do token JWT

    // O nome do arquivo é anexado pelo Multer
    const foto_pet = req.file ? req.file.filename : null;

    if (!especie || !sexo || !status) {
        removeImage(foto_pet);
        return res.status(400).json({ message: 'Espécie, sexo e status são obrigatórios.' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO pets (id_usuario, nome, especie, raca, idade, sexo, porte, cor, descricao, status, latitude, longitude, foto_pet)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_usuario, nome, especie, raca, idade, sexo, porte, cor, descricao, status, latitude, longitude, foto_pet]
        );

        res.status(201).json({ message: 'Pet cadastrado com sucesso!', id_pet: result.insertId, foto_pet: foto_pet });

    } catch (error) {
        console.error('Erro ao cadastrar pet:', error);
        removeImage(foto_pet);
        res.status(500).json({ message: 'Erro interno do servidor ao cadastrar pet.' });
    }
};

// [GET] Listar todos os Pets (com filtros)
exports.getAllPets = async (req, res) => {
    const { status, especie, cidade, estado } = req.query;
    let query = `
        SELECT p.*, u.nome AS nome_usuario, u.email AS email_usuario
        FROM pets p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE 1=1
    `;
    const params = [];

    if (status) {
        query += ' AND p.status = ?';
        params.push(status);
    }
    if (especie) {
        query += ' AND p.especie = ?';
        params.push(especie);
    }
    if (cidade) {
        query += ' AND u.cidade = ?';
        params.push(cidade);
    }
    if (estado) {
        query += ' AND u.estado = ?';
        params.push(estado);
    }

    query += ' ORDER BY p.data_registro DESC';

    try {
        const [pets] = await pool.query(query, params);
        res.status(200).json(pets);
    } catch (error) {
        console.error('Erro ao listar pets:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao listar pets.' });
    }
};

// [GET] Obter Pet por ID
exports.getPetById = async (req, res) => {
    const { id } = req.params;

    try {
        const [pets] = await pool.query(
            `SELECT p.*, u.nome AS nome_usuario, u.email AS email_usuario, u.telefone AS telefone_usuario
             FROM pets p
             JOIN usuarios u ON p.id_usuario = u.id_usuario
             WHERE p.id_pet = ?`,
            [id]
        );

        if (pets.length === 0) {
            return res.status(404).json({ message: 'Pet não encontrado.' });
        }

        res.status(200).json(pets[0]);
    } catch (error) {
        console.error('Erro ao obter pet por ID:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao obter pet.' });
    }
};

// [PUT] Atualizar Pet
exports.updatePet = async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.userId;
    const { nome, especie, raca, idade, sexo, porte, cor, descricao, status, latitude, longitude } = req.body;
    const nova_foto_pet = req.file ? req.file.filename : null;

    try {
        // 1. Verificar se o pet existe e se pertence ao usuário logado
        const [pets] = await pool.query('SELECT foto_pet FROM pets WHERE id_pet = ? AND id_usuario = ?', [id, id_usuario]);
        if (pets.length === 0) {
            removeImage(nova_foto_pet);
            return res.status(404).json({ message: 'Pet não encontrado ou você não tem permissão para editá-lo.' });
        }

        const petAtual = pets[0];
        let foto_pet_final = petAtual.foto_pet;

        // 2. Se uma nova foto foi enviada, deletar a antiga
        if (nova_foto_pet) {
            removeImage(petAtual.foto_pet);
            foto_pet_final = nova_foto_pet;
        }

        // 3. Atualizar o pet
        const [result] = await pool.query(
            `UPDATE pets SET nome = ?, especie = ?, raca = ?, idade = ?, sexo = ?, porte = ?, cor = ?, descricao = ?, status = ?, latitude = ?, longitude = ?, foto_pet = ?
             WHERE id_pet = ?`,
            [nome, especie, raca, idade, sexo, porte, cor, descricao, status, latitude, longitude, foto_pet_final, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pet não encontrado ou nenhum dado alterado.' });
        }

        res.status(200).json({ message: 'Pet atualizado com sucesso!', foto_pet: foto_pet_final });

    } catch (error) {
        console.error('Erro ao atualizar pet:', error);
        removeImage(nova_foto_pet);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar pet.' });
    }
};

// [DELETE] Excluir Pet
exports.deletePet = async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.userId;

    try {
        // 1. Verificar se o pet existe e se pertence ao usuário logado
        const [pets] = await pool.query('SELECT foto_pet FROM pets WHERE id_pet = ? AND id_usuario = ?', [id, id_usuario]);
        if (pets.length === 0) {
            return res.status(404).json({ message: 'Pet não encontrado ou você não tem permissão para excluí-lo.' });
        }

        const petAtual = pets[0];

        // 2. Deletar o pet do banco (a exclusão em cascata cuidará das adoções e mensagens)
        const [result] = await pool.query('DELETE FROM pets WHERE id_pet = ?', [id]);

        if (result.affectedRows > 0) {
            // 3. Deletar a imagem do sistema de arquivos
            removeImage(petAtual.foto_pet);
            res.status(200).json({ message: 'Pet excluído com sucesso.' });
        } else {
            res.status(404).json({ message: 'Pet não encontrado.' });
        }

    } catch (error) {
        console.error('Erro ao excluir pet:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao excluir pet.' });
    }
};
