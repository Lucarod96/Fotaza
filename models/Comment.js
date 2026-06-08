import { Model, DataTypes } from "sequelize";
import sequelize from "./config.js";

export class Comment extends Model {}

Comment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    },
    {
        sequelize,
        modelName: 'Comment',
        tableName: 'comentarios',
        timestamps: true,
    }
);