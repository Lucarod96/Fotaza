import { Model, DataTypes } from "sequelize";
import sequelize from "./config.js";

export class Tag extends Model {}

Tag.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true, // Evita etiquetas duplicadas en la tabla principal
        }
    },
    {
        sequelize,
        modelName: 'Tag',
        tableName: 'etiquetas',
        timestamps: true,
    }
);