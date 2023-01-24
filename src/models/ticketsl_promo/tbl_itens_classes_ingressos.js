const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_classes_ingressos = require('./tbl_classes_ingressos');


/**
 * Itens dos ingressos?
 * 
 * foreign key:
 * - tbl_classes_ingressos (itc_classe → cla_cod)
 */
const tbl_itens_classes_ingressos = db_conn.define(
    'tbl_itens_classes_ingressos',
    {
        itc_cod: {
            type: DataTypes.INTEGER(60),
            autoIncrement: true,
            primaryKey: true
        },

        itc_classe: {
            type: DataTypes.INTEGER(60)
        },

        itc_quantidade: {
            type: DataTypes.INTEGER(5)
        },

        itc_valor: {
            type: DataTypes.DECIMAL(14,2)
        },

        itc_prioridade: {
            type: DataTypes.STRING(60)
        },

        itc_data_inclusao: {
            type: DataTypes.DATE
        },

        itc_data_virada: {
            type: DataTypes.DATEONLY
        },

        itc_data_modificacao: {
            type: DataTypes.DATE
        },

        itc_login_modificacao: {
            type: DataTypes.STRING
        },

        itc_ip_modificacao: {
            type: DataTypes.STRING(40)
        }
    },
    { timestamps: false }
);

// foreign keys

// tbl_classes_ingressos (itc_classe → cla_cod)
tbl_classes_ingressos.hasMany(tbl_itens_classes_ingressos, {
    foreignKey: 'itc_classe',
    sourceKey: 'cla_cod',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_itens_classes_ingressos.belongsTo(tbl_classes_ingressos, {
    foreignKey: 'itc_classe',
    targetKey: 'cla_cod'
});

module.exports = tbl_itens_classes_ingressos;