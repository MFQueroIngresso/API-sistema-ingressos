const routes = require('express').Router();

// Importa as rotas dos controllers
const POS = require('./pos.router');

// Definindo as rotas
routes.use('/pos', POS);

// Definindo a rota de erro 404
routes.use('*', (_, res) => (
    res.status(404).json({ error: 'API desconhecida' })
));

module.exports = routes;