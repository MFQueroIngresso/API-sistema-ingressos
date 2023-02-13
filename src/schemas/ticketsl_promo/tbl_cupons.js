const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_classes_ingressos = require('./tbl_classes_ingressos');


/**
 * Tabela com os cupons de ingressos
 * 
 * foreign key:
 * - tbl_classes_ingressos (classe_ingresso_id → cla_cod)
 */
const tbl_cupons = db_conn.define(
    'tbl_cupons',
    {
        cupom_id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },
        nome: {
            type: DataTypes.STRING(128)
        },
        
        tipo: {
            type: DataTypes.CHAR(1)
        },
        
        desconto: {
            type: DataTypes.DECIMAL(15,4)
        },
        
        total: {
            type: DataTypes.DECIMAL(15,4)
        },
        
        data_inicio: {
            type: DataTypes.DATEONLY
        },
        
        data_fim: {
            type: DataTypes.DATEONLY
        },
        
        status: {
            type: DataTypes.TINYINT(1)
        },
        
        data_criado: {
            type: DataTypes.DATE
        },
        
        classe_ingresso_id: {
            type: DataTypes.INTEGER(11)
        },
        
        desconto_para: {
            type: DataTypes.TINYINT(1)
        },
        
        coupon_id: {
            type: DataTypes.INTEGER(11)
        }
    },
    { timestamps: false }
);

// foreign key

// tbl_classes_ingressos (classe_ingresso_id → cla_cod)
tbl_classes_ingressos.hasMany(tbl_cupons, {
    foreignKey: 'classe_ingresso_id',
    sourceKey: 'cla_cod',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
tbl_cupons.belongsTo(tbl_classes_ingressos, {
    foreignKey: 'classe_ingresso_id',
    targetKey: 'cla_cod'
});

module.exports = tbl_cupons;