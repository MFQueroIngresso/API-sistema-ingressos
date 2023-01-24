const routes = require('express').Router();

// Importa as rotas dos controllers

// Definindo as rotas

// Definindo a rota de erro 404
routes.use('*', (_, res) => (
    res.status(404).json({ error: 'API desconhecida' })
));

module.exports = routes;