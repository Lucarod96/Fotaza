import fs from 'fs';
import { postValidation } from "../helpers/validations.js";
import { Post } from "../models/Post.js";
import { PostImage } from "../models/PostImage.js";
import { Tag } from "../models/Tag.js";
import { User } from "../models/User.js";
import { Comment } from "../models/Comment.js";
import { Rating } from "../models/Rating.js";
import { Op } from 'sequelize';


function getAuthenticatedUserId(req) {
  const userId = Number(req.user?.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }
  return userId;
}

function buildValidationMessage(validacion) {
  let msg = '';
  if (validacion.errors.title) validacion.errors.title.forEach(e => msg += ` ${e}`);
  if (validacion.errors.tags) validacion.errors.tags.forEach(e => msg += ` ${e}`);
  return msg.trim() || 'Datos de la publicación inválidos.';
}

// Formulario para crear publicación
export async function getNewPost(req, res) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).redirect('/auth/login');

  res.render('posts/new', {
    values: { title: '', description: '', tags: '', license: 'Sin copyright' }
  });
}

// Guardar la publicación en la BD
export async function postNewPost(req, res) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).redirect('/auth/login');

  const body = req.body;
  const files = req.files; // Array de imágenes gracias a Multer

  // 1. Verificamos que sí o sí haya enviado al menos una imagen
  if (!files || files.length === 0) {
    return res.status(400).render('posts/new', {
      values: body,
      alert: { status: 'error', text: '¡Debes subir al menos una imagen!' },
    });
  }

  // 2. Validamos el texto con Zod
  const postData = {
    title: body.title,
    description: body.description,
    tags: body.tags,
    license: body.license
  };

  const validacion = postValidation(postData);

  // Si Zod falla, borramos las fotos que subió Multer para no ocupar espacio basura
  if (validacion.success === false) {
    files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    return res.status(400).render('posts/new', {
      values: body,
      alert: { status: 'error', text: buildValidationMessage(validacion) },
    });
  }

  try {
    // 3. Creamos el Post principal
    const nuevoPost = await Post.create({
      title: postData.title,
      description: postData.description,
      license: postData.license,
      userId: userId,
    });

    // 4. Guardamos todas las imágenes relacionadas a ese Post
    const imageRecords = files.map(file => ({
      imageUrl: `/uploads/${file.filename}`,
      postId: nuevoPost.id
    }));
    await PostImage.bulkCreate(imageRecords);

    // 5. Procesamos las etiquetas
    // Separamos por comas, limpiamos espacios y sacamos vacíos
    const tagsArray = postData.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag !== '');
    
    for (const tagName of tagsArray) {
      // findOrCreate busca la etiqueta. Si no existe, la crea (Evita duplicados en la tabla general)
      const [etiqueta, created] = await Tag.findOrCreate({ 
        where: { name: tagName } 
      });
      // addTag es una función que crea Sequelize para vincular el Post con el Tag
      await nuevoPost.addTag(etiqueta); 
    }

    // Redireccionamos al home 
    res.redirect('/');
    
  } catch (error) {
    console.error('Error al guardar la publicación completa:', error);
    
    // Si algo falla en la BD, borramos las fotos por seguridad
    files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    res.status(500).render('posts/new', {
      values: body,
      alert: { status: 'error', text: 'Hubo un error al guardar la foto en la base de datos.' },
    });
  }
}

// Muestra el feed de publicaciones en el Home
export async function getHome(req, res) {
  try {
    const isLogedIn = !!(req.session && req.session.user);
    const searchQuery = req.query.search ? req.query.search.trim() : '';
    
    // 1. Filtro base de seguridad por Copyright
    let dondePost = {};
    if (!isLogedIn) {
      dondePost.license = 'Sin copyright';
    }

    // 2. Filtro dinámico de búsqueda y armado de relaciones
    let dondeUser = {};
    let includeGroup = [
      {
        model: PostImage,
        attributes: ['imageUrl'],
      },
      {
        model: User,
        where: dondeUser, // Aplica el filtro si se busca por @usuario
        attributes: ['username']
      },
      {
        model: Rating,
        attributes: ['stars']
      }
    ];

    if (searchQuery) {
      if (searchQuery.startsWith('@')) {
        // BÚSQUEDA POR USUARIO: Si escribe @usuario, filtramos en el JOIN de la tabla User
        const cleanUsername = searchQuery.replace('@', '');
        dondeUser.username = { [Op.iLike]: `%${cleanUsername}%` };
        
        // Incluimos Tag vacío para que mantenga consistencia la consulta
        includeGroup.push({
          model: Tag,
          attributes: ['name'],
          through: { attributes: [] },
          required: false
        });
      } else {
        // BÚSQUEDA COMBINADA: Coincidencia en Título OR Nombre de la Etiqueta
        dondePost[Op.or] = [
          { title: { [Op.iLike]: `%${searchQuery}%` } },
          { '$Tags.name$': { [Op.iLike]: `%${searchQuery}%` } } // Rastreación profunda por el string de asociación
        ];

        // Incluimos las etiquetas de forma obligatoria en la estructura lógica de los modelos
        includeGroup.push({
          model: Tag,
          attributes: ['name'],
          through: { attributes: [] }, // Evita traer columnas basura de la tabla intermedia
          required: false 
        });
      }
    } else {
      // Si no hay búsqueda activa, igual incluimos el modelo Tag limpio
      includeGroup.push({
        model: Tag,
        attributes: ['name'],
        through: { attributes: [] },
        required: false
      });
    }

    // 3. Ejecutamos la consulta definitiva
    const posts = await Post.findAll({
      where: dondePost,
      include: includeGroup,
      order: [['createdAt', 'DESC']],
      subQuery: false // Evita que Sequelize limite antes de cruzar los JOINs de las etiquetas
    });

    // 4. Renderizamos pasando el searchQuery para mantener viva la palabra en la barra
    res.render('index', { posts, searchQuery });

  } catch (error) {
    console.error('Error en el buscador del Feed:', error);
    res.status(500).send('Error interno al procesar la búsqueda.');
  }
}

// 1. Mostrar el detalle de una publicación específica con sus comentarios
export async function getPostDetail(req, res) {
  try {
    const postId = req.params.id;

    // Buscamos el post por su ID, incluyendo sus imágenes, su autor y sus comentarios
    const post = await Post.findByPk(postId, {
      include: [
        { model: PostImage, attributes: ['imageUrl'] },
        { model: User, attributes: ['username'] },
        {
          model: Comment,
          include: [{ model: User, attributes: ['username'] }]
        }
      ],
      order: [[Comment, 'createdAt', 'ASC']]
    });

    if (!post) {
      return res.status(404).send('Publicación no encontrada.');
    }

    // CALCULAMOS EL PROMEDIO REAL DESDE LA TABLA VALORACIONES
    const valoraciones = await Rating.findAll({ where: { postId: post.id } });
    const totalVotos = valoraciones.length;
    let promedio = 0;
    
    if (totalVotos > 0) {
        const suma = valoraciones.reduce((acc, val) => acc + val.stars, 0);
        promedio = (suma / totalVotos).toFixed(1);
    }

    res.render('posts/show', { 
        post, 
        comments: post.Comments || [],
        promedioEstrellas: promedio,
        totalVotos: totalVotos
    });

  } catch (error) {
    console.error('Error al cargar el detalle del post:', error);
    res.status(500).send('Error interno del servidor.');
  }
}

// 2. Guardar un comentario nuevo en la base de datos
export async function postComment(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).send('Debes iniciar sesión para comentar.');
    }

    const postId = req.params.id;
    const userId = req.session.user.id;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.redirect(`/posts/${postId}`); // Si está vacío, recarga sin hacer nada
    }

    // Creamos el registro en la tabla usando tu modelo Comment
    await Comment.create({
      content: content.trim(),
      postId: postId,
      userId: userId
    });

    // Redireccionamos de vuelta al detalle del post para ver el comentario en vivo
    res.redirect(`/posts/${postId}`);

  } catch (error) {
    console.error('Error al crear el comentario:', error);
    res.status(500).send('Error interno al guardar el comentario.');
  }
}

// Guardar o actualizar la valoración de estrellas
export async function postRate(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).send('Debes iniciar sesión para valorar.');
    }

    const postId = req.params.id;
    const userId = req.session.user.id;
    const puntaje = parseInt(req.body.stars); 

    if (puntaje < 1 || puntaje > 5) {
      return res.redirect(`/posts/${postId}`);
    }

    // 1. Buscamos el post para verificar quién es el dueño
    const post = await Post.findByPk(postId);
    if (!post) {
        return res.status(404).send('Publicación no encontrada.');
    }

    // 2. El autor no puede valorar su propia publicación
    if (post.userId === userId) {
        return res.redirect(`/posts/${postId}`);
    }

    // 3. Buscamos si el usuario ya le había dado estrellas a esta foto antes
    let valoracionPrevia = await Rating.findOne({ where: { postId: postId, userId: userId } });

    if (valoracionPrevia) {
      // Si ya existía, modificamos las estrellas por el nuevo puntaje
      valoracionPrevia.stars = puntaje;
      await valoracionPrevia.save();
    } else {
      // Si es la primera vez que vota esta foto, creamos el registro
      await Rating.create({
        stars: puntaje,
        postId: postId,
        userId: userId
      });
    }

    // Redireccionamos al detalle para ver el impacto del promedio al instante
    res.redirect(`/posts/${postId}`);

  } catch (error) {
    console.error('Error al guardar la valoración:', error);
    res.status(500).send('Error interno al procesar las estrellas.');
  }
}