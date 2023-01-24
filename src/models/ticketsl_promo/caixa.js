const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_eventos = require('./tbl_eventos');


/**
 * Tabela com o total em caixa dos eventos
 * 
 * foreign key:
 * - tbl_eventos (EVENTO_CODIGO → eve_cod)
 */
const caixa = db_conn.define(
    'caixa',
    {
        CODIGO: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },

        NOME: {
            type: DataTypes.STRING(40)
        },

        FECHADO: {
            type: DataTypes.STRING(1)
        },

        EVENTO_CODIGO: {
            type: DataTypes.INTEGER(11)
        },

        DATA_HORA_ABERTURA: {
            type: 'TIMESTAMP'
        },

        DATA_HORA_FECHAMENTO: {
            type: 'TIMESTAMP'
        },

        TOTAL_DINHEIRO: {
            type: DataTypes.DECIMAL(10,2)
        },

        TOTAL_DEBITO: {
            type: DataTypes.DECIMAL(10,2)
        },

        TOTAL_CREDITO: {
            type: DataTypes.DECIMAL(10,2)
        }
    },
    { timestamps: false }
);

// foreign key

// tbl_eventos (EVENTO_CODIGO → eve_cod)
tbl_eventos.hasMany(caixa, {
    foreignKey: 'EVENTO_CODIGO',
    sourceKey: 'eve_cod',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
caixa.belongsTo(tbl_eventos, {
    foreignKey: 'EVENTO_CODIGO',
    targetKey: 'eve_cod'
});

module.exports = caixa;