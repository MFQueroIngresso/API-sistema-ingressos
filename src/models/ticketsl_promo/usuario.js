const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const grupo_de_usuarios = require('./grupo_de_usuarios');
const regra_de_acesso = require('./regra_de_acesso');


/**
 * Tabela com os usuários
 * 
 * foreign keys:
 * - grupo_de_usuarios (GRUPO → CODIGO)
 * - regra_de_acesso (REGRA_DE_ACESSO → CODIGO)
 */
const usuario = db_conn.define(
    'usuario',
    {
        CODIGO: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        
        GRUPO: {
            type: DataTypes.INTEGER(11),
            unique: false//
        },
        
        LOGIN: {
            type: DataTypes.STRING(60)
        },
        
        SENHA: {
            type: DataTypes.STRING
        },
        
        REGRA_DE_ACESSO: {
            type: DataTypes.INTEGER(11),
            unique: false//
        },
        
        ATIVO: {
            type: DataTypes.TINYINT(1)
        },
        
        EMAIL: {
            type: DataTypes.STRING(70)
        }
    },
    { timestamps: false }
);

// foreign keys

// grupo_de_usuarios (GRUPO → CODIGO)
grupo_de_usuarios.hasMany(usuario, {
    foreignKey: 'GRUPO',
    sourceKey: 'CODIGO',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
usuario.belongsTo(grupo_de_usuarios, {
    foreignKey: 'GRUPO',
    targetKey: 'CODIGO'
});

// regra_de_acesso (REGRA_DE_ACESSO → CODIGO)
regra_de_acesso.hasMany(usuario, {
    foreignKey: 'REGRA_DE_ACESSO',
    sourceKey: 'CODIGO',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
usuario.belongsTo(regra_de_acesso, {
    foreignKey: 'REGRA_DE_ACESSO',
    targetKey: 'CODIGO'
});

module.exports = usuario;