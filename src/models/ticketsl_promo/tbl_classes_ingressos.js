const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_eventos = require('./tbl_eventos');
const tbl_empresas = require('./tbl_empresas');
const tbl_setores = require('./tbl_setores');


/**
 * Tabela das classes dos ingressos
 * 
 * foreign keys:
 * - tbl_eventos (cla_evento → eve_cod)
 * - tbl_empresas (cla_empresa → emp_id)
 * - tbl_setores (cla_setor → id)
 */
const tbl_classes_ingressos = db_conn.define(
    'tbl_classes_ingressos',
    {
        cla_cod: {
            type: DataTypes.INTEGER(60),
            autoIncrement: true,
            primaryKey: true
        },

        cla_evento: {
            type: DataTypes.INTEGER(60)
        },

        cla_nome: {
            type: DataTypes.STRING(60)
        },

        cla_data_inclusao: {
            type: DataTypes.DATE
        },

        cla_empresa: {
            type: DataTypes.INTEGER(60)
        },

        cla_nome_pos: {
            type: DataTypes.STRING(60)
        },

        cla_valor_taxa: {
            type: DataTypes.DECIMAL(7,2)
        },

        cla_view_sts: {
            type: DataTypes.INTEGER(11)
        },

        cla_meia_inteira: {
            type: DataTypes.TINYINT(1)
        },

        cla_numeracao: {
            type: DataTypes.TINYINT(1)
        },

        cla_imp_lote: {
            type: DataTypes.TINYINT(1)
        },

        cla_imp_valor: {
            type: DataTypes.TINYINT(1)
        },

        cla_imp_taxa: {
            type: DataTypes.TINYINT(1)
        },

        cla_taxa_perc: {
            type: DataTypes.TINYINT(1)
        },

        cla_tipo: {
            type: DataTypes.INTEGER(1)
        },

        cla_qtde_mesa: {
            type: DataTypes.INTEGER(11)
        },

        cla_imp_data: {
            type: DataTypes.TINYINT(1)
        },

        cla_imp_hora: {
            type: DataTypes.TINYINT(1)
        },

        cla_imp_via: {
            type: DataTypes.TINYINT(1)
        },

        cla_imp_total: {
            type: DataTypes.TINYINT(1)
        },

        cla_frase: {
            type: DataTypes.STRING
        },

        cla_mapa_id: {
            type: DataTypes.STRING(99)
        },

        cla_setor: {
            type: DataTypes.INTEGER(11)
        },

        cla_categoria_id: {
            type: DataTypes.INTEGER(11)
        },

        cla_exibe_lote_atual: {
            type: DataTypes.TINYINT(1)
        }
    },
    { timestamps: false }
);

// foreign keys

//tbl_eventos (cla_evento → eve_cod)
tbl_eventos.hasMany(tbl_classes_ingressos, {
    foreignKey: 'cla_evento',
    sourceKey: 'eve_cod',
    onUpdate: 'cascade',
    onDelete: 'set null',
    hooks: true
});
tbl_classes_ingressos.belongsTo(tbl_eventos, {
    foreignKey: 'cla_evento',
    targetKey: 'eve_cod'
});

// tbl_empresas (cla_empresa → emp_id)
tbl_empresas.hasMany(tbl_classes_ingressos, {
    foreignKey: 'cla_empresa',
    sourceKey: 'emp_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_classes_ingressos.belongsTo(tbl_empresas, {
    foreignKey: 'cla_empresa',
    targetKey: 'emp_id'
});

// tbl_setores (cla_setor → id)
tbl_setores.hasMany(tbl_classes_ingressos, {
    foreignKey: 'cla_setor',
    sourceKey: 'id',
    onUpdate: 'no action',
    onDelete: 'set null',
    hooks: true
});
tbl_classes_ingressos.belongsTo(tbl_setores, {
    foreignKey: 'cla_setor',
    targetKey: 'id'
});

module.exports = tbl_classes_ingressos;