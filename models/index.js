import sequelize from "./config.js";
import { User } from "./User.js";
// Pronto importar modelos

let associationsInitialized = false;

export function initializeAssociations() {
    if (associationsInitialized) {
        return;
    }

    // Acá irán las relaciones en el futuro
    // User.hasMany(Post, { foreignKey: 'userId' });
    
    associationsInitialized = true;
}

export async function connectDatabase() {
    try {
        initializeAssociations();
        await sequelize.authenticate();
        console.log('[+] Conexion a bd establecida');
        
    } catch (error) {
        console.error('[+] Error en la conexión a la base de datos:', error);
        throw error;
    }
}

export async function syncDatabase() {
    try {
        initializeAssociations();
        await sequelize.sync({ alter: true });
        console.log('[+] Base de datos inicializada y tablas creadas correctamente');
    } catch (error) {
        console.error('[+] Error al sincronizar las tablas:', error);
        throw error;
    }
}