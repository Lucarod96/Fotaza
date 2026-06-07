import { Model, DataTypes } from "sequelize";
import sequelize from "./config.js";
import bcrypt from 'bcrypt';

export class User extends Model {
    // Método para verificar la contraseña en el Login
    validatePassword(password) {
        return bcrypt.compare(password, this.password);
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true // Validación para que sea sí o sí un correo
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        sequelize, // Necesario para conectarse a la bd
        modelName: 'User', // Nombre del modelo
        tableName: 'usuarios', // Nombre de la tabla en Postgres
        createdAt: true, // cada vez que crea un usuario coloca la fecha de creacion
        deletedAt: true, // cada vez que se elimina un usuario coloca la fecha de eliminacion
        hooks: {
            // Hook para encriptar la clave antes de guardarla
            beforeSave: async (usuario) => {
                if (!usuario.password) return;
                if (!usuario.changed('password')) return;
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(usuario.password, salt);
                usuario.password = hashedPassword;
            }
        }
    }
);