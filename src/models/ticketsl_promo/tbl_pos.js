const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_pdvs = require('./tbl_pdvs');
const tbl_modelo_pos = require('./tbl_modelo_pos');
const tbl_empresas = require('./tbl_empresas');


/**
 * Tabela das maquininhas (POS)
 * 
 * foreign keys:
 * - tbl_pdvs (pos_pdv → pdv_id)
 * - tbl_modelo_pos (pos_modelo → mod_cod)
 * - tbl_empresas (pos_empresa → emp_id)
 */
const tbl_pos = db_conn.define(
    'tbl_pos',
    {
        pos_serie: {
            type: DataTypes.STRING(60),
            primaryKey: true
        },

        pos_modelo: {
            type: DataTypes.STRING(60)
        },

        pos_pdv: {
            type: DataTypes.INTEGER(60)
        },

        pos_operadora: {
            type: DataTypes.STRING(60)
        },

        pos_finalidade: {
            type: DataTypes.STRING(60)
        },

        pos_data_inclusao: {
            type: DataTypes.DATE
        },

        pos_numero_chip: {
            type: DataTypes.STRING(60)
        },

        pos_empresa: {
            type: DataTypes.INTEGER(60)
        },

        pos_posweb_key: {
            type: DataTypes.STRING(60)
        },

        pos_versao_navs: {
            type: DataTypes.STRING(60)
        },

        pos_versao_qi: {
            type: DataTypes.STRING(60)
        },

        pos_numero_celular: {
            type: DataTypes.STRING(60)
        },

        pos_tipo_conexao: {
            type: DataTypes.STRING(45)
        },

        pos_data_credito: {
            type: DataTypes.DATE
        },

        pos_ativacao_smart_card: {
            type: DataTypes.STRING(60)
        },

        pos_password: {
            type: DataTypes.STRING
        },

        pos_quantidade_parcela: {
            type: DataTypes.INTEGER(11)
        },

        pos_percentual_taxa: {
            type: DataTypes.DECIMAL(14,2)
        }
    },
    { timestamps: false }
);

// foreign keys

// tbl_pdvs (pos_pdv → pdv_id)
tbl_pdvs.hasMany(tbl_pos, {
    foreignKey: 'pos_pdv',
    sourceKey: 'pdv_id',
    onUpdate: 'cascade',
    onDelete: 'set null',
    hooks: true
});
tbl_pos.belongsTo(tbl_pdvs, {
    foreignKey: 'pos_pdv',
    targetKey: 'pdv_id'
});

// tbl_modelo_pos (pos_modelo → mod_cod)
tbl_modelo_pos.hasMany(tbl_pos, {
    foreignKey: 'pos_modelo',
    sourceKey: 'mod_cod',
    onUpdate: 'no action',
    onDelete: 'no action',
    hooks: true
});
tbl_pos.belongsTo(tbl_modelo_pos, {
    foreignKey: 'pos_modelo',
    targetKey: 'mod_cod'
});

// tbl_empresas (pos_empresa → emp_id)
tbl_empresas.hasMany(tbl_pos, {
    foreignKey: 'pos_empresa',
    sourceKey: 'emp_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_pos.belongsTo(tbl_empresas, {
    foreignKey: 'pos_empresa',
    targetKey: 'emp_id'
});


module.exports = tbl_pos;