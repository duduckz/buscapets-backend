const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Obter o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido ou formato inválido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. Verificar e decodificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Anexar o ID do usuário à requisição
        req.userId = decoded.id;

        // 4. Continuar para a próxima função (controller)
        next();
    } catch (error) {
        console.error('Erro na verificação do token:', error);
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;
