const { pool } = require('../conexao');

const listarTransacoes = async (req, res) => {
    try {
        const usuarioId = req.id;

        const consulta = `SELECT * FROM transacoes
            WHERE usuario_id = $1`;

        const { rows } = await pool.query(consulta, [usuarioId]);

        return res.status(200).json(rows);
    } catch (error) {
        ;
        return res.status(500).json({ mensagem: 'O servidor encontrou um erro ao processar a solicitação.' });
    }
};


const detalharTransacao = async (req, res) => {
    try {
        const usuarioId = req.id;
        const transacaoId = req.params.id; // ID da transação a partir dos parâmetros de rota

        const consulta = `
        SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao AS categoria_nome
        FROM transacoes t
        INNER JOIN categorias c ON t.categoria_id = c.id
        WHERE t.id = $1 AND t.usuario_id = $2`;

        const { rows } = await pool.query(consulta, [transacaoId, usuarioId]);
        const transacao = rows[0];
        if (rows.length === 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada.' });
        }
        return res.status(200).json(transacao);


    } catch (error) {

        return res.status(500).json({ mensagem: 'O servidor encontrou um erro ao processar a solicitação.' });
    }
};



const cadastrarTransacao = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const usuarioId = req.id;

    try {


        if (!descricao?.trim() || !valor || !categoria_id || !tipo || !data?.trim()) {

            return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' });

        };


        if (tipo !== 'entrada' && tipo !== 'saida') {

            return res.status(400).json({ mensagem: `O campo 'tipo' deve ser 'entrada' ou 'saida'.` });

        };

        const categoriaQuery = `SELECT id FROM categorias WHERE id = $1;`;
        const categoriaResult = await pool.query(categoriaQuery, [categoria_id]);
        if (categoriaResult.rowCount === 0) {

            return res.status(400).json({ mensagem: 'Categoria não encontrada.' });
        };

        const inserirTransacaoQuery =
            `INSERT INTO transacoes (descricao, valor, data, categoria_id, usuario_id, tipo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, tipo, descricao,data, valor, usuario_id, categoria_id;`;

        const inserirTransacaoValues = [descricao, valor, data, categoria_id, usuarioId, tipo];
        const { rows } = await pool.query(inserirTransacaoQuery, inserirTransacaoValues);

        const transacao = rows[0];

        return res.status(201).json(transacao);

    } catch (error) {

        return res.status(500).json({ mensagem: 'O servidor encontrou um erro ao processar a solicitação.' });
    }
};

const autalizarTransacao = async (req, res) => {

    try {
        const { descricao, valor, data, categoria_id, tipo } = req.body;
        const usuarioId = req.id;
        const transacaoId = req.params.id;

        if (!descricao?.trim() || !valor || !data?.trim() || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' });
        };

        if (tipo !== 'entrada' && tipo !== 'saida') {
            return res.status(400).json({ mensagem: 'O campo "tipo" deve ser "entrada" ou "saida".' });
        };

        const consultaExistencia =
            `SELECT id
            FROM transacoes
            WHERE id = $1 AND usuario_id = $2`;

        const { rows } = await pool.query(consultaExistencia, [transacaoId, usuarioId]);

        if (rows.length === 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada ou não pertence ao usuário logado.' });
        };

        const atualizacaoQuery =
            `UPDATE transacoes
            SET descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5
            WHERE id = $6`;

        await pool.query(atualizacaoQuery, [descricao, valor, data, categoria_id, tipo, transacaoId]);

        return res.status(204).send();


    } catch (error) {

        return res.status(500).json({ mensagem: 'O servidor encontrou um erro ao processar a solicitação.' });
    }

};

const deletarTransacao = async (req, res) => {

    try {

        const usuarioId = req.id;
        const transacaoId = req.params.id;

        const consultaExistencia =
            `SELECT id
            FROM transacoes
            WHERE id = $1 AND usuario_id = $2`;

        const { rows } = await pool.query(consultaExistencia, [transacaoId, usuarioId]);

        if (rows.length === 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada ou não pertence ao usuário logado.' });
        }

        const exclusaoQuery =
            `DELETE FROM transacoes
            WHERE id = $1`;

        await pool.query(exclusaoQuery, [transacaoId]);

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ mensagem: 'O servidor encontrou um erro ao processar a solicitação.' });
    }
};

const extratoTransacao = async (req, res) => {
    try {
        const usuarioId = req.id;
        const queryEncontradasEntrada = `SELECT SUM(valor) AS total FROM transacoes WHERE usuario_id = $1 AND tipo = 'entrada'`;
        const { rows: entradas } = await pool.query(queryEncontradasEntrada, [usuarioId]);
        const totalEntrada = entradas[0].total || 0;
        const queryEncontradasSaida =
            `SELECT SUM(valor) AS total
        FROM transacoes
        WHERE usuario_id = $1 AND tipo = 'saida'`;
        const { rows: saidas } = await pool.query(queryEncontradasSaida, [usuarioId]);
        const totalSaida = saidas[0].total || 0;

        // Montar o objeto de resposta com os valores calculados
        const extrato = {
            entrada: totalEntrada,
            saida: totalSaida,
        };
        return res.status(200).json(extrato);

    } catch (error) {
        return res.status(500).json({ mensagem: 'O servidor encontrou um erro ao processar a solicitação.' });
    }
};

module.exports = {
    listarTransacoes,
    detalharTransacao,
    cadastrarTransacao,
    autalizarTransacao,
    deletarTransacao,
    extratoTransacao

}