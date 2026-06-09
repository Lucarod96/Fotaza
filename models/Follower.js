import { Model, DataTypes } from "sequelize";
import sequelize from "./config.js";

export class Follower extends Model {}

Follower.init(
    {
        // Esta tabla usa una Clave Primaria Compuesta (followerId + followingId)
        // Evita automáticamente que un usuario siga dos veces a la misma persona.
        followerId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        followingId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        }
    },
    {
        sequelize,
        modelName: 'Follower',
        tableName: 'seguidores',
        timestamps: true,
    }
);