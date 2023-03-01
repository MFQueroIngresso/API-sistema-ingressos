// Schema do banco de dados: ticketsl_promo
/* Obs.:
    Por enquanto, somente algumas tabelas estão
    definidas no Sequelize.
*/

const abastecimento = require('./abastecimento');
const caixa = require('./caixa');
const grupo_de_usuarios = require('./grupo_de_usuarios');
const ingresso_cancelado = require('./ingresso_cancelado');
const regra_de_acesso = require('./regra_de_acesso');
const sangria = require('./sangria');
const tbl_categorias_classes_ingressos = require('./tbl_categorias_classes_ingressos');
const tbl_classe_grupo = require('./tbl_classe_grupo');
const tbl_classe_numeracao = require('./tbl_classe_numeracao');
const tbl_classes_ingressos_cupons = require('./tbl_classes_ingressos_cupons');
const tbl_classes_ingressos_pdvs = require('./tbl_classes_ingressos_pdvs');
const tbl_classes_ingressos = require('./tbl_classes_ingressos');
const tbl_clientes = require('./tbl_clientes');
const tbl_comprovante_sangria = require('./tbl_comprovante_sangria');
const tbl_cupons = require('./tbl_cupons');
const tbl_empresas = require('./tbl_empresas');
const tbl_eventos_pdvs = require('./tbl_eventos_pdvs');
const tbl_eventos = require('./tbl_eventos');
const tbl_ingressos = require('./tbl_ingressos');
const tbl_itens_classes_ingressos_historicos = require('./tbl_itens_classes_ingressos_historicos');
const tbl_itens_classes_ingressos = require('./tbl_itens_classes_ingressos');
const tbl_meio_pgto = require('./tbl_meio_pgto');
const tbl_modelo_pos = require('./tbl_modelo_pos');
const tbl_pdvs = require('./tbl_pdvs');
const tbl_perfis = require('./tbl_perfis');
const tbl_pos = require('./tbl_pos');
const tbl_sangria = require('./tbl_sangria');
const tbl_sangrias = require('./tbl_sangrias');
const tbl_setores = require('./tbl_setores');
const tbl_status = require('./tbl_status');
const tbl_tipo_empresas = require('./tbl_tipo_empresas');
const tbl_usuarios = require('./tbl_usuarios');
const usuario = require('./usuario');


/**
 * Sincroniza as tabelas do Sequelize com o MySQL
 * 
 * Obs.: As tabelas devem estar inversamente ordenadas
 *       pelas referências das foreign keys.
 * 
 * ex: tbl_empresas → tbl_clientes, tbl_empresas vem antes de tbl_clientes
 */
const syncModels = async () => {
    /* { alter: true } */
    await tbl_classe_numeracao.sync();
    await grupo_de_usuarios.sync();
    await tbl_meio_pgto.sync();
    await tbl_modelo_pos.sync();
    await tbl_perfis.sync();
    await regra_de_acesso.sync();
    await tbl_setores.sync();
    await tbl_status.sync();
    await tbl_tipo_empresas.sync();
    await tbl_empresas.sync();
    await tbl_clientes.sync();
    await tbl_usuarios.sync();
    await usuario.sync();
    await tbl_eventos.sync();
    await tbl_categorias_classes_ingressos.sync();
    await caixa.sync();
    await abastecimento.sync();
    await sangria.sync();
    await tbl_comprovante_sangria.sync();
    await tbl_pdvs.sync();
    await tbl_eventos_pdvs.sync();
    await tbl_pos.sync();
    await tbl_sangria.sync();
    await tbl_sangrias.sync();
    await tbl_classes_ingressos.sync();
    await tbl_classe_grupo.sync();
    await tbl_classes_ingressos_pdvs.sync();
    await tbl_cupons.sync();
    await tbl_classes_ingressos_cupons.sync();
    await tbl_itens_classes_ingressos.sync();
    await tbl_itens_classes_ingressos_historicos.sync();
    await tbl_ingressos.sync();
    await ingresso_cancelado.sync();
}

syncModels();

module.exports = {
    abastecimento,
    caixa,
    grupo_de_usuarios,
    ingresso_cancelado,
    regra_de_acesso,
    sangria,
    tbl_categorias_classes_ingressos,
    tbl_classe_grupo,
    tbl_classe_numeracao,
    tbl_classes_ingressos_cupons,
    tbl_classes_ingressos_pdvs,
    tbl_classes_ingressos,
    tbl_clientes,
    tbl_comprovante_sangria,
    tbl_cupons,
    tbl_empresas,
    tbl_eventos_pdvs,
    tbl_eventos,
    tbl_ingressos,
    tbl_itens_classes_ingressos_historicos,
    tbl_itens_classes_ingressos,
    tbl_meio_pgto,
    tbl_modelo_pos,
    tbl_pdvs,
    tbl_perfis,
    tbl_pos,
    tbl_sangria,
    tbl_sangrias,
    tbl_setores,
    tbl_status,
    tbl_tipo_empresas,
    tbl_usuarios,
    usuario,
}