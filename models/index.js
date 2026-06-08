import sequelize from "./config.js";
import { User } from "./User.js";
import { Post } from "./Post.js";
import { Comment } from "./Comment.js";
import { Rating } from "./Rating.js";
// Pronto importar modelos

let associationsInitialized = false;

export function initializeAssociations() {
    if (associationsInitialized) {
        return;
    }

    // RELACIÓN DE PUBLICACIONES 1 A N 
    // (Un usuario tiene muchos posts, un post pertenece a un usuario)
    User.hasMany(Post, { foreignKey: 'userId' });
    Post.belongsTo(User, { foreignKey: 'userId' });
    
    // RELACIONES DE COMENTARIOS
    // Un Usuario escribe muchos comentarios 1 A N 
    User.hasMany(Comment, { foreignKey: 'userId' });
    Comment.belongsTo(User, { foreignKey: 'userId' });

    // Una Publicación contiene muchos comentarios 1 A N 
    Post.hasMany(Comment, { foreignKey: 'postId' });
    Comment.belongsTo(Post, { foreignKey: 'postId' });

    // RELACIONES DE VALORACIONES
    // Un Usuario hace muchas valoraciones 1 A N
    User.hasMany(Rating, { foreignKey: 'userId' });
    Rating.belongsTo(User, { foreignKey: 'userId' });

    // Una Publicación recibe muchas valoraciones 1 A N
    Post.hasMany(Rating, { foreignKey: 'postId' });
    Rating.belongsTo(Post, { foreignKey: 'postId' });

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