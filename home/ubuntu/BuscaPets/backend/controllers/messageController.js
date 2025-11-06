const pool = require('../config/db');

// [POST] Enviar nova mensagem
exports.sendMessage = async (req, res) => {
    const id_remetente = req.userId;
    const { id_destinatario, id_pet, conteudo } = req.body;

    if (!id_destinatario || !conteudo) {
        return res.status(400).json({ message: 'Destinatário e conteúdo da mensagem são obrigatórios.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO mensagens (id_remetente, id_destinatario, id_pet, conteudo) VALUES (?, ?, ?, ?)',
            [id_remetente, id_destinatario, id_pet || null, conteudo]
        );

        res.status(201).json({ message: 'Mensagem enviada com sucesso!', id_mensagem: result.insertId });

    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao enviar mensagem.' });
    }
};

// [GET] Listar todas as conversas do usuário logado
exports.listConversations = async (req, res) => {
    const userId = req.userId;

    try {
        // Seleciona os IDs dos usuários com quem o usuário logado conversou
        const [conversations] = await pool.query(
            `SELECT DISTINCT
                CASE
                    WHEN id_remetente = ? THEN id_destinatario
                    ELSE id_remetente
                END AS parceiro_id
            FROM mensagens
            WHERE id_remetente = ? OR id_destinatario = ?`,
            [userId, userId, userId]
        );

        if (conversations.length === 0) {
            return res.status(200).json([]);
        }

        // Obtém os dados dos usuários parceiros
        const parceiroIds = conversations.map(c => c.parceiro_id);
        const [parceiros] = await pool.query(
            `SELECT id_usuario, nome, email, foto_perfil FROM usuarios WHERE id_usuario IN (?)`,
            [parceiroIds]
        );

        res.status(200).json(parceiros);

    } catch (error) {
        console.error('Erro ao listar conversas:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao listar conversas.' });
    }
};

// [GET] Listar mensagens de uma conversa específica
exports.getConversationMessages = async (req, res) => {
    const userId = req.userId;
    const { id_usuario } = req.params; // ID do outro usuário na conversa

    try {
        const [messages] = await pool.query(
            `SELECT m.*, u_rem.nome AS nome_remetente, u_dest.nome AS nome_destinatario
             FROM mensagens m
             JOIN usuarios u_rem ON m.id_remetente = u_rem.id_usuario
             JOIN usuarios u_dest ON m.id_destinatario = u_dest.id_usuario
             WHERE (m.id_remetente = ? AND m.id_destinatario = ?)
                OR (m.id_remetente = ? AND m.id_destinatario = ?)
             ORDER BY m.data_envio ASC`,
            [userId, id_usuario, id_usuario, userId]
        );

        res.status(200).json(messages);

    } catch (error) {
        console.error('Erro ao obter mensagens da conversa:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao obter mensagens.' });
    }
};
