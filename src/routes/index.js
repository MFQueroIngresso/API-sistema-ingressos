const routes = require('express').Router();

// Importa as rotas dos controllers
const ClienteEmpresa = require('./clientes.empresas.router');
const Ingresso = require('./ingresso.router');
const PDV = require('./pdv.router');
const POS = require('./pos.router');
const Status = require('./status.router');

// Definindo as rotas
routes.use('/cliente-empresa', ClienteEmpresa);
routes.use('/ing', Ingresso);
routes.use('/pdv', PDV);
routes.use('/pos', POS);
routes.use('/status', Status);

// Definindo a rota de erro 404
routes.use('*', (_, res) => (
    res.status(404).json({ error: 'API desconhecida' })
));

module.exports = routes;