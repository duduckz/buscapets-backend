const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Função de Cadastro de Usuário
exports.registerUser = async (req, res) => {
    const { nome, email, senha, telefone, cidade, estado } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }

    try {
        // 1. Verificar se o usuário já existe
        const [existingUser] = await pool.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Este email já está cadastrado.' });
        }

        // 2. Criptografar a senha (bcrypt.hash já gera o salt automaticamente)
        const hashedPassword = await bcrypt.hash(senha, 10);

        // 3. Inserir o novo usuário no banco de dados
        const [result] = await pool.query(
            'INSERT INTO usuarios (nome, email, senha, telefone, cidade, estado) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, email, hashedPassword, telefone, cidade, estado]
        );

        // 4. Gerar o token JWT
        const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            message: 'Usuário cadastrado com sucesso!',
            token,
            user: {
                id: result.insertId,
                nome,
                email
            }
        });

    } catch (error) {
        console.error('Erro no cadastro de usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao cadastrar usuário.' });
    }
};

// Função de Login de Usuário
exports.loginUser = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        // 1. Buscar o usuário pelo email
        const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // 2. Comparar a senha fornecida com o hash no banco
        const isMatch = await bcrypt.compare(senha, user.senha);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // 3. Gerar o token JWT
        const token = jwt.sign({ id: user.id_usuario }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // 4. Retornar o token e dados do usuário (sem a senha)
        const { senha: _, ...userData } = user;

        res.status(200).json({
            message: 'Login realizado com sucesso!',
            token,
            user: userData
        });

    } catch (error) {
        console.error('Erro no login de usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao realizar login.' });
    }
};

// Função para Obter Perfil do Usuário
exports.getUserProfile = async (req, res) => {
    try {
        // O ID do usuário é anexado ao objeto req pelo middleware de autenticação
        const userId = req.userId;

        const [users] = await pool.query('SELECT id_usuario, nome, email, telefone, cidade, estado, foto_perfil, data_cadastro FROM usuarios WHERE id_usuario = ?', [userId]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json(user);

    } catch (error) {
        console.error('Erro ao obter perfil do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao obter perfil.' });
    }
};

// Função para Atualizar Perfil do Usuário
exports.updateUserProfile = async (req, res) => {
    const userId = req.userId;
    const { nome, telefone, cidade, estado, nova_senha } = req.body;

    try {
        let updateQuery = 'UPDATE usuarios SET nome = ?, telefone = ?, cidade = ?, estado = ?';
        const updateParams = [nome, telefone, cidade, estado];

        // Se uma nova senha for fornecida, criptografar e adicionar à query
        if (nova_senha) {
            const hashedPassword = await bcrypt.hash(nova_senha, 10);
            updateQuery += ', senha = ?';
            updateParams.push(hashedPassword);
        }

        updateQuery += ' WHERE id_usuario = ?';
        updateParams.push(userId);

        const [result] = await pool.query(updateQuery, updateParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado ou nenhum dado alterado.' });
        }

        res.status(200).json({ message: 'Perfil atualizado com sucesso!' });

    } catch (error) {
        console.error('Erro ao atualizar perfil do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar perfil.' });
    }
};

// Função para Excluir Usuário
exports.deleteUser = async (req, res) => {
    const userId = req.userId;

    try {
        // A exclusão em cascata cuidará dos pets, mensagens e adoções relacionados
        const [result] = await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json({ message: 'Usuário excluído com sucesso.' });

    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao excluir usuário.' });
    }
};
