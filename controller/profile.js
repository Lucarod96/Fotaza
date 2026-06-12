import { Post } from "../models/Post.js";
import { PostImage } from "../models/PostImage.js";
import { User } from "../models/User.js";
import { Follower } from "../models/Follower.js"; 
import { Tag } from "../models/Tag.js";
import { Rating } from "../models/Rating.js";

// Renderiza el perfil del usuario logueado actualmente
export async function getMyProfile(req, res) {
    try {
        if (!req.session || !req.session.user) {
            return res.redirect('/auth/login');
        }

        const userId = req.session.user.id; 

        const user = await User.findByPk(userId, {
            include: [
                {
                    model: Post,
                    include: [
                        { model: PostImage, attributes: ['imageUrl'] },
                        { 
                            model: Tag, 
                            attributes: ['name'], 
                            through: { attributes: [] }
                        },
                        { model: Rating, attributes: ['stars'] }
                    ]
                }
            ],
            order: [[Post, 'createdAt', 'DESC']]
        });

        if (!user) {
            return res.status(404).send('Usuario no encontrado.');
        }

        // 1. Contamos mis propias estadísticas
        const followersCount = await Follower.count({ where: { followingId: userId } });
        const followingCount = await Follower.count({ where: { followerId: userId } });
        const postCount = user.Posts ? user.Posts.length : 0;

        res.render('profile', { 
            profileUser: user, 
            posts: user.Posts || [], 
            isOwnProfile: true,
            isFollowing: false,
            stats: { followers: followersCount, following: followingCount, posts: postCount }
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

        if (loggedInUser && loggedInUser.username === targetUsername) {
            return res.redirect('/profile');
        }

        const user = await User.findOne({
            where: { username: targetUsername },
            include: [
                {
                    model: Post,
                    include: [
                        { model: PostImage, attributes: ['imageUrl'] },
                        { 
                            model: Tag, 
                            attributes: ['name'], 
                            through: { attributes: [] }
                        },
                        { model: Rating, attributes: ['stars'] }
                    ]
                }
            ],
            order: [[Post, 'createdAt', 'DESC']]
        });

        if (!user) {
            return res.status(404).send('Usuario no encontrado.');
        }

        let postsFiltrados = user.Posts || [];
        if (!loggedInUser) {
            postsFiltrados = postsFiltrados.filter(post => post.license === 'Sin copyright');
        }

        // 2. Revisamos si el usuario logueado ya sigue a este perfil
        let isFollowing = false;
        if (loggedInUser) {
            const checkFollow = await Follower.findOne({
                where: { followerId: loggedInUser.id, followingId: user.id }
            });
            isFollowing = !!checkFollow; // Si encuentra el registro, es true
        }

        // 3. Contamos las estadísticas del usuario que estamos visitando
        const followersCount = await Follower.count({ where: { followingId: user.id } });
        const followingCount = await Follower.count({ where: { followerId: user.id } });
        const postCount = postsFiltrados.length;

        res.render('profile', { 
            profileUser: user, 
            posts: postsFiltrados, 
            isOwnProfile: false,
            isFollowing: isFollowing, // Le avisa al Pug si muestra "Seguir" o "Dejar de seguir"
            stats: { followers: followersCount, following: followingCount, posts: postCount }
        });

    } catch (error) {
        console.error('Error al cargar el perfil del usuario:', error);
        res.status(500).send('Error interno del servidor.');
    }
}

// 4. Lógica para procesar el clic en Seguir / Dejar de seguir
export async function toggleFollow(req, res) {
    try {
        const loggedInUserId = req.session.user.id;
        const targetUsername = req.params.username;

        const targetUser = await User.findOne({ where: { username: targetUsername } });

        if (!targetUser) {
            return res.status(404).send('Usuario no encontrado.');
        }

        if (targetUser.id === loggedInUserId) {
            return res.redirect(`/profile/${targetUsername}`);
        }

        // Buscamos si ya existe el follow
        const existingFollow = await Follower.findOne({
            where: { followerId: loggedInUserId, followingId: targetUser.id }
        });

        if (existingFollow) {
            // Si ya lo seguía, borramos la relación
            await existingFollow.destroy();
        } else {
            // Si no lo seguía, lo agregamos a la tabla
            await Follower.create({ followerId: loggedInUserId, followingId: targetUser.id });
        }

        // Recargamos la vista para que impacte el cambio
        res.redirect(`/profile/${targetUsername}`);

    } catch (error) {
        console.error('Error al procesar el botón de seguir:', error);
        res.status(500).send('Error interno del servidor.');
    }
}