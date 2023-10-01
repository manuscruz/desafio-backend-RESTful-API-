const express = require('express');
const { cadastrarUsuario, loginUsuario, detalharUsuario, atualizarUsuario } = require('./controladores/usuarios');
const { listarCategorias } = require('./controladores/categorias');
const { listarTransacoes, detalharTransacao, cadastrarTransacao, autalizarTransacao, deletarTransacao, extratoTransacao } = require('./controladores/transacoes');
const { verificaUsuarioLogado } = require('./intermediarios/autenticacao');

const rotas = express();

rotas.post('/usuario', cadastrarUsuario);
rotas.post('/login', loginUsuario);
rotas.use(verificaUsuarioLogado);
rotas.get('/usuario', detalharUsuario);
rotas.put('/usuario', atualizarUsuario);
rotas.get('/categoria', listarCategorias);

rotas.get("/transacao", listarTransacoes);
rotas.get('/transacao/extrato', extratoTransacao);
rotas.get('/transacao/:id', detalharTransacao);
rotas.post('/transacao', cadastrarTransacao);
rotas.put('/transacao/:id', autalizarTransacao),
rotas.delete('/transacao/:id', deletarTransacao)

module.exports = rotas;