const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_itens_classes_ingressos = require('./tbl_itens_classes_ingressos');


/**
 * Tabela do histórico de estoque dos ingressos
 * 
 * foreign key:
 * - tbl_itens_classes_ingressos (icih_item_classe_ingresso_id → itc_cod)
 */
const tbl_itens_classes_ingressos_historicos = db_conn.define(
    'tbl_itens_classes_ingressos_historicos',
    {
        icih_id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },
        
        icih_item_classe_ingresso_id: {
            type: DataTypes.INTEGER(11)
        },
        
        icih_data: {
            type: DataTypes.DATE
        },
        
        icih_login: {
            type: DataTypes.STRING
        },
        
        icih_ip: {
            type: DataTypes.STRING(45)
        },
        
        icih_quantidade_old: {
            type: DataTypes.INTEGER(11)
        },
        
        icih_quantidade_new: {
            type: DataTypes.INTEGER(11)
        },
        
        icih_valor_old: {
            type: DataTypes.DECIMAL(14,2)
        },
        
        icih_valor_new: {
            type: DataTypes.DECIMAL(14,2)
        },
        
        icih_virada_old: {
            type: DataTypes.DATEONLY
        },
        
        icih_virada_new: {
            type: DataTypes.DATEONLY
        }
    },
    { timestamps: false }
);

// foreign key

// tbl_itens_classes_ingressos (icih_item_classe_ingresso_id → itc_cod)
tbl_itens_classes_ingressos.hasMany(tbl_itens_classes_ingressos_historicos, {
    foreignKey: 'icih_item_classe_ingresso_id',
    sourceKey: 'itc_cod',
    onUpdate: 'no action',
    onDelete: 'cascade',
    hooks: true
});
tbl_itens_classes_ingressos_historicos.belongsTo(tbl_itens_classes_ingressos, {
    foreignKey: 'icih_item_classe_ingresso_id',
    targetKey: 'itc_cod'
});

module.exports = tbl_itens_classes_ingressos_historicos;