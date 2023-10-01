const { pool } = require('../conexao');

const listarCategorias = async (req, res) => {
    try {
        const query = await pool.query(`select * from categorias`);
        return res.status(200).json(query.rows);
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

module.exports = {
    listarCategorias
}