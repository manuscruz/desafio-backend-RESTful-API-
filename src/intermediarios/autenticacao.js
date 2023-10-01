const jwt = require('jsonwebtoken');
const senhaJwt = require('../senhaJwt');

const verificaUsuarioLogado = async (req, res, next) => {
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({ message: 'Não autorizado!!!' });
    }

    const token = (authorization.split(' '))[1];

    try {
        const { id } = jwt.verify(token, senhaJwt);
        req.id = id;
        req.token = token;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Não autorizado' });
    }
}

module.exports = {
    verificaUsuarioLogado
}