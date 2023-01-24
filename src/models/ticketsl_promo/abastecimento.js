const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const caixa = require('./caixa');


/**
 * Tabela com o abastecimento de caixa dos eventos
 * 
 * foreign key:
 * - caixa (CAIXA → CODIGO)
 */
const abastecimento = db_conn.define(
    'abastecimento',
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
caixa.hasMany(abastecimento, {
    foreignKey: 'CAIXA',
    sourceKey: 'CODIGO',
    onUpdate: 'restrict',
    onDelete: 'cascade',
    hooks: true
});
abastecimento.belongsTo(caixa, {
    foreignKey: 'CAIXA',
    targetKey: 'CODIGO'
});

module.exports = abastecimento;