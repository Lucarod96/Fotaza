import sequelize from '../models/config.js';
import { initializeAssociations } from '../models/index.js'; 

import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { PostImage } from '../models/PostImage.js';
import { Comment } from '../models/Comment.js';
import { Follower } from '../models/Follower.js';
import { Rating } from '../models/Rating.js';
import { Tag } from '../models/Tag.js'; 

const usersToCreate = [
  {
    username: "user",
    email: "user@test.com",
    password: "pass123", 
  },
  {
    username: "admin",
    email: "admin@test.com",
    password: "pass123",
  }
];

const postsData = [
  // USUARIO 1 "user" - ID: 1
  { title: "El Kaiser de la F1", desc: "Schumacher, leyenda absoluta.", file: "schumacher.jpg", userId: 1, tags: ["F1", "Ferrari"] },
  { title: "Magia bajo la lluvia", desc: "Ayrton Senna, inigualable.", file: "ayrton.jpg", userId: 1, tags: ["F1", "Senna"] },
  { title: "Mi setup", desc: "El setup de estudio y gaming.", file: "setup.jpeg", userId: 1, tags: ["Setup"] },
  { title: "Dean Dime From Hell", desc: "Una bestia para el metal.", file: "dean.jpeg", userId: 1, tags: ["Guitarra", "Metal"] },
  { title: "Dimebag Darrell", desc: "El maestro del riff en acción.", file: "dimebag.jpg", userId: 1, tags: ["Pantera", "Idolo"] },
  { title: "Riff master", desc: "Esa barba y esa guitarra, épicos.", file: "dimebag2.jpg", userId: 1, tags: ["Guitar", "Pantera"] },
  { title: "Phoebe", desc: "La gatita mas hermosa del mundo.", file: "phoebe.jpg", userId: 1, tags: ["Gatos"] },
  { title: "Mirada atenta", desc: "Phoebe vigilando todo.", file: "phoebe2.jpg", userId: 1, tags: ["Mascotas", "Gatos"] },
  { title: "Siesta compartida", desc: "Phoebe y Eren recargando energías.", file: "phoeberen.jpg", userId: 1, tags: ["Gatos", "Siesta"] },
  { title: "Eren posando", desc: "Todo un modelo.", file: "eren.jpeg", userId: 1, tags: ["Gatos", "Facha"] },
  { title: "La clásica bolsa", desc: "Eren encontró su lugar favorito en el mundo.", file: "eren2.jpeg", userId: 1, tags: ["Gatos"] },
  { title: "La clásica F40", desc: "El mejor auto de la historia.", file: "ferrarif40.jpg", userId: 1, tags: ["Autos", "Clasico"] },

  // USUARIO 2 "admin" - ID: 2
  { title: "Arte de ojo", desc: "Arte abstracto.", file: "arte1.jpeg", userId: 2, tags: ["Arte", "Abstracto"] },
  { title: "Árbol de la vida", desc: "Pintura espectacular.", file: "arte2.jpeg", userId: 2, tags: ["Pintura", "Naturaleza"] },
  { title: "Reflejo perfecto", desc: "El árbol y el agua fundiéndose.", file: "arte3.jpeg", userId: 2, tags: ["Arte", "Paisaje"] },
  { title: "Atardecer digital", desc: "Arte sobre el lago.", file: "arte4.jpeg", userId: 2, tags: ["DigitalArt", "Fondos"] },
  { title: "Franco en pista", desc: "El alpine a fondo.", file: "alpine1.JPG", userId: 2, tags: ["F1", "Alpine"] },
  { title: "Scuderia Ferrari", desc: "Detalle lateral de la Sf26.", file: "ferrari1.png", userId: 2, tags: ["F1", "Ferrari"] },
  { title: "Ferrari desde atrás", desc: "La aerodinámica al máximo.", file: "ferrari2.png", userId: 2, tags: ["F1", "Aerodinamica"] },
  { title: "F40 en el bosque", desc: "Contraste perfecto.", file: "f40.jpg", userId: 2, tags: ["Autos", "Paisaje"] },
  { title: "F40 rojo fuego", desc: "Impresionante desde cualquier ángulo.", file: "f401.jpg", userId: 2, tags: ["Ferrari", "Motor"] },
  { title: "F40 versión oscura", desc: "Elegancia y velocidad.", file: "f402.jpg", userId: 2, tags: ["Autos", "Deportivo"] },
  { title: "RB19", desc: "El auto campeón de Red Bull.", file: "redbull1.jpg", userId: 2, tags: ["RedBull", "F1"] },
  { title: "Detalle Red Bull", desc: "Pura ingeniería.", file: "redbull2.jpg", userId: 2, tags: ["F1", "Campeon"] },
];

async function seed() {
  try {
    initializeAssociations();
    await sequelize.sync({ alter: true, force: true });
    console.log("Tablas sincronizadas y limpiadas...");

    const users = [];
    for (const user of usersToCreate) {
      users.push(await User.create(user));
    }

    await Follower.bulkCreate([
        { followerId: users[0].id, followingId: users[1].id },
        { followerId: users[1].id, followingId: users[0].id }
    ]);

    for (const data of postsData) {
        const post = await Post.create({
            title: data.title,
            description: data.desc,
            userId: data.userId,
            license: data.userId === 1 ? "Todos los derechos reservados" : "Sin copyright"
        });

        await PostImage.create({
            imageUrl: `/uploads/${data.file}`,
            postId: post.id
        });

        for (const tagName of data.tags) {
            const [tag, created] = await Tag.findOrCreate({
                where: { name: tagName }
            });

            if (post.addTag) {
                await post.addTag(tag); 
            }
        }
    }
    console.log("Las 24 publicaciones, imágenes y etiquetas fueron creadas...");

    await Comment.bulkCreate([
        { content: "¡Qué hermosos ojos!.", postId: 7, userId: 2 }, 
        { content: "Esa Dean es una reliquia histórica, ¡tremenda!", postId: 4, userId: 2 }, 
        { content: "Hermoso auto, pero me quedo con el de Colapinto jaja", postId: 23, userId: 1 }, 
        { content: "Qué locura de colores tiene ese cuadro", postId: 13, userId: 1 } 
    ]);

    await Rating.bulkCreate([
        { stars: 5, postId: 7, userId: 2 }, 
        { stars: 5, postId: 1, userId: 2 }, 
        { stars: 4, postId: 15, userId: 1 }, 
        { stars: 5, postId: 24, userId: 1 }, 
    ]);

    console.log("¡Seed de Fotaza completado!");
    sequelize.close();

  } catch (error) {
    console.error("Error al correr el seed:", error);
    sequelize.close();
  }
}

seed();