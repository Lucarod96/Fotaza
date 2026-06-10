import { Model, DataTypes } from "sequelize";
import sequelize from "./config.js";

export class PostImage extends Model {}

PostImage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        imageUrl: {
            type: DataTypes.STRING(255),
            allowNull: false,
        }
    },
    {
        sequelize,
        modelName: 'PostImage',
        tableName: 'imagenes_publicacion',
        timestamps: true,
    }
);