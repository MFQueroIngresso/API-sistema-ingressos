const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_empresas = require('./tbl_empresas');
const tbl_perfis = require('./tbl_perfis');
const tbl_clientes = require('./tbl_clientes');


/**
 * Tabela com os usuários (tbl_usuarios)
 * 
 * foreign keys:
 * - tbl_empresas (usu_empresa → emp_id)
 * - tbl_perfis (usu_perfil → per_cod)
 * - tbl_clientes (usu_cliente → cli_id)
 */
const tbl_usuarios = db_conn.define(
    'tbl_usuarios',
    {
        usu_id: {
            type: DataTypes.INTEGER(60),
            autoIncrement: true,
            primaryKey: true
        },
        
        usu_empresa: {
            type: DataTypes.INTEGER(60)
        },
        
        usu_perfil: {
            type: DataTypes.STRING(60)
        },
        
        usu_nome: {
            type: DataTypes.STRING(60)
        },
        
        usu_email: {
            type: DataTypes.STRING(60)
        },

        usu_senha: {
            type: DataTypes.STRING(60)
        },

        usu_data_inclusao: {
            type: DataTypes.DATE
        },
        
        usu_login: {
            type: DataTypes.STRING(60)
        },

        usu_cliente: {
            type: DataTypes.INTEGER(60)
        }
    },
    { timestamps: false }
);

// foreign keys

// tbl_empresas (usu_empresa → emp_id)
tbl_empresas.hasMany(tbl_usuarios, {
    foreignKey: 'usu_empresa',
    sourceKey: 'emp_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_usuarios.belongsTo(tbl_empresas, {
    foreignKey: 'usu_empresa',
    targetKey: 'emp_id'
});

// tbl_perfis (usu_perfil → per_cod)
tbl_perfis.hasMany(tbl_usuarios, {
    foreignKey: 'usu_perfil',
    sourceKey: 'per_cod',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_usuarios.belongsTo(tbl_perfis, {
    foreignKey: 'usu_perfil',
    targetKey: 'per_cod'
});

// tbl_clientes (usu_cliente → cli_id)
tbl_clientes.hasMany(tbl_usuarios, {
    foreignKey: 'usu_cliente',
    sourceKey: 'cli_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_usuarios.belongsTo(tbl_clientes, {
    foreignKey: 'usu_cliente',
    targetKey: 'cli_id'
});

module.exports = tbl_usuarios;