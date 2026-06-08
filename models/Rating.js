import { Model, DataTypes } from "sequelize";
import sequelize from "./config.js";

export class Rating extends Model {}

Rating.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        stars: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        }
    },
    {
        sequelize,
        modelName: 'Rating',
        tableName: 'valoraciones',
        timestamps: true,
    }
);