const { ticketsl_promo } = require('../models');
const {
    tbl_clientes,
    tbl_empresas,
    tbl_tipo_empresas
} = ticketsl_promo;

/**
 * Controlador dos clientes e empresas
 */
class ClienteEmpresaController {
    
    /**
     * Obtêm a lista de Clientes e Empresas
     * 
     * @param {*} _
     * @param {Response} res 
     */
    static async list(_, res) {
        try {
            const list = [
                await tbl_clientes.findAll(),
                await tbl_empresas.findAll()
            ]

            Promise.all(list).then(data => {
                res.json({
                    clientes: data[0],
                    empresas: data[1]
                });
            });
        }
        catch(e) {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Obter os Clientes/Empresas',
                message: JSON.stringify(e)
            });
        }
    }

    /**
     * Cadastra um novo Cliente
     * 
     * ex.: {
     *      cli_nome,
     *      cli_telefone,
     *      cli_endereco,
     *      cli_observacao,
     *      cli_empresa,
     *      cli_data_inclusao
     * }
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static async add_cli(req, res) {
        await tbl_clientes.create(JSON.parse(JSON.stringify(req.body)))
        .then(data => {
            res.json({
                message: 'Cliente Cadastrado',
                id: data?.cli_id
            });
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Cadastrar o Cliente',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Cadastra uma nova Empresa
     * 
     * ex.: {
     *      emp_nome,
     *      emp_telefone,
     *      emp_endereco,
     *      emp_observacao,
     *      emp_data_inclusao,
     *      emp_http_site,
     *      emp_tipo,
     *      emp_status,
     * }
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static async add_emp(req, res) {
        await tbl_empresas.create(JSON.parse(JSON.stringify(req.body)))
        .then(data => {
            res.json({
                message: 'Empresa Cadastrada',
                id: data?.emp_id
            });
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Cadastrar a Empresa',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Cadastra um novo tipo de empresa
     * 
     * ex.: { tip_descricao }
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static async add_tipo_emp(req, res) {
        const { tip_descricao } = req.body;

        await tbl_tipo_empresas.create({
            tip_descricao,
            tip_data_inclusao: new Date()
        })
        .then(data => {
            res.json({
                message: 'Tipo de Empresa Cadastrado',
                id: data?.tip_cod
            });
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Cadastrar o Tipo de Empresa',
                message: JSON.stringify(e)
            });
        });
    }
}

module.exports = ClienteEmpresaController;