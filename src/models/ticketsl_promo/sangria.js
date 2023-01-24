const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const caixa = require('./caixa');


/**
 * Tabela das sangrias
 * 
 * foreign key:
 * - caixa (CAIXA → CODIGO)
 */
const sangria = db_conn.define(
    'sangria',
    {
        CODIGO: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },

        CAIXA: {
            type: DataTypes.INTEGER(11)
        },

        VALOR: {
            type: DataTypes.DECIMAL(10,2)
        },

        DATA_HORA: {
            type: 'TIMESTAMP'
        },

        HISTORICO: {
            type: DataTypes.STRING
        }
    },
    { timestamps: false }
);

// foreign key

// caixa (CAIXA → CODIGO)
caixa.hasMany(sangria, {
    foreignKey: 'CAIXA',
    sourceKey: 'CODIGO',
    onUpdate: 'restrict',
    onDelete: 'cascade',
    hooks: true
});
sangria.belongsTo(caixa, {
    foreignKey: 'CAIXA',
    targetKey: 'CODIGO'
});

module.exports = sangria;