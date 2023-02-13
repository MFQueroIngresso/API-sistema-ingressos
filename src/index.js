const express = require('express');
const cors = require('cors');
require("dotenv").config();

// Definindo o serviço
const app = express();

// Porta de operação
const port = process.env.PORT || 3000;

// COnfigurações do serviço
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uso das rotas definidas
const routes = require('./routes'); 
app.use('/', routes);

// Iniciando o serviço
app.listen(port, () => {
    console.log(`\n------------- Serviço executando na porta: ${port} -------------\n`);
});