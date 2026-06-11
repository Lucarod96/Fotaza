import { Post } from "../models/Post.js";
import { PostImage } from "../models/PostImage.js";
import { User } from "../models/User.js";

// Renderiza el perfil del usuario logueado actualmente
export async function getMyProfile(req, res) {
    try {
        // req.session.user tiene los datos del usuario logueado en la sesión activa
        if (!req.session || !req.session.user) {
            return res.redirect('/auth/login');
        }

        const myUsername = req.session.user.username;

        // Buscamos al usuario en la BD para traer sus publicaciones
        const user = await User.findOne({
            where: { username: myUsername },
            include: [
                {
                    model: Post,
                    include: [{ model: PostImage, attributes: ['imageUrl'] }]
                }
            ],
            order: [[Post, 'createdAt', 'DESC']]
        });

        // Renderizamos la vista pasándole 'isOwnProfile: true' para ocultar el botón Seguir
        res.render('profile', { 
            profileUser: user, 
            posts: user.Posts || [], 
            isOwnProfile: true,
            isFollowing: false
        });

    } catch (error) {
        console.error('Error al cargar mi perfil:', error);
        res.status(500).send('Error interno del servidor.');
    }
}

// Renderiza el perfil de cualquier usuario por su @username
export async function getUserProfile(req, res) {
    try {
        const targetUsername = req.params.username;
        const loggedInUser = req.session?.user;

        // Si el usuario intenta buscar su propio username en la URL, lo mandamos a su sección nativa
        if (loggedInUser && loggedInUser.username === targetUsername) {
            return res.redirect('/profile');
        }

        // Buscamos al usuario objetivo
        const user = await User.findOne({
            where: { username: targetUsername },
            include: [
                {
                    model: Post,
                    include: [{ model: PostImage, attributes: ['imageUrl'] }]
                }
            ],
            order: [[Post, 'createdAt', 'DESC']]
        });

        if (!user) {
            return res.status(404).send('Usuario no encontrado.');
        }

        // Filtro de Seguridad por Copyright si el visitante es anónimo (Invitado)
        let postsFiltrados = user.Posts || [];
        if (!loggedInUser) {
            postsFiltrados = postsFiltrados.filter(post => post.license === 'Sin copyright');
        }

        const isFollowing = false; 

        res.render('profile', { 
            profileUser: user, 
            posts: postsFiltrados, 
            isOwnProfile: false,
            isFollowing: isFollowing
        });

    } catch (error) {
        console.error('Error al cargar el perfil del usuario:', error);
        res.status(500).send('Error interno del servidor.');
    }
}