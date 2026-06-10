import fs from 'fs';
import { postValidation } from "../helpers/validations.js";
import { Post } from "../models/Post.js";
import { PostImage } from "../models/PostImage.js";
import { Tag } from "../models/Tag.js";

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

export async function getNewPost(req, res) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).redirect('/auth/login');

  res.render('posts/new', {
    values: { title: '', description: '', tags: '', license: 'Sin copyright' }
  });
}

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
      // findOrCreate busca la etiqueta. Si no existe, la crea. (Evita duplicados en la tabla general)
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