const { pool } = require('../conexao');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const senhaJwt = require('../senhaJwt');


const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    if (!nome?.trim() || !email?.trim() || !senha?.trim()) {
        return res.status(400).json({ message: 'Campo obrigatório não declarado ou em branco.' })
    }

    try {
        const usuario = await pool.query(`select * from usuarios where email = $1`, [email]);
        if (usuario.rowCount < 1) {
            const novoUsuario = await pool.query(`insert into usuarios (nome, email, senha) values ($1, $2, $3) returning *`, [nome, email, senhaCriptografada]);

            const { senha: _, ...usuarioExibido } = novoUsuario.rows[0];
            return res.status(201).json({ novoUsuario: usuarioExibido });
        } else {
            return res.status(404).json({ message: 'Email já cadastrado!' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

const loginUsuario = async (req, res) => {
    const { email, senha } = req.body;
    if (!email?.trim() || !senha?.trim()) {
        return res.status(400).json({ message: 'Campo obrigatório não declarado ou em branco.' })
    }
    try {
        const usuario = await pool.query(`select * from usuarios where email = $1`, [email]);
        if (usuario.rowCount < 1) {
            return res.status(404).json({ message: 'Usuário não existe.' });
        } else {
            const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha);
            if (!senhaValida) {
                return res.status(400).json({ message: 'Email ou senha inválido' });
            }

            const token = jwt.sign({ id: usuario.rows[0].id }, senhaJwt, { expiresIn: '8h' })
            const { senha: _, ...usuarioLogado } = usuario.rows[0];
            return res.status(200).json({ usuario: usuarioLogado, token });

        }
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
}


const detalharUsuario = async (req, res) => {
    try {
        const { rows } = await pool.query(`select id, nome, email from usuarios where id = $1`, [req.id])
        return res.status(200).json(rows[0]);
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

const atualizarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome?.trim() || !email?.trim() || !senha?.trim()) {
        return res.status(400).json({ message: 'Campo obrigatório não declarado ou em branco.' })
    }

    const usuario = await pool.query(`select * from usuarios where email = $1`, [email]);
    if (usuario.rowCount < 1) {
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        const usuarioAtualizado = await pool.query(`update usuarios set nome = $1, email = $2, senha = $3 where id = $4`, [nome, email, senhaCriptografada, req.id])
        return res.status(201).json();
    } else {
        return res.status(500).json({ message: 'O e-mail informado já está sendo utilizado por outro usuário.' });

    }
}

module.exports = {
    cadastrarUsuario,
    loginUsuario,
    detalharUsuario,
    atualizarUsuario
}

