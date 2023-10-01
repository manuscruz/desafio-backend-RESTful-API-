const porta = 3000;
const express = require('express');
const app = express();
const rotas = require('./rotas');

app.use(express.json());
app.use(rotas);

app.listen(porta);