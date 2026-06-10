import { postValidation } from "../helpers/validations.js";
import { Post } from "../models/Post.js";

function getAuthenticatedUserId(req) {
  const userId = Number(req.user?.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }
  return userId;
}

function buildValidationMessage(validacion) {
  const titleError = validacion.errors.title;
  const imageError = validacion.errors.imageUrl;

  let msg = '';
  if (titleError) {
    for (const e of titleError) msg += ` ${e}`;
  }
  if (imageError) {
    for (const e of imageError) msg += ` ${e}`;
  }

  return msg.trim() || 'Datos de la publicación inválidos.';
}

export async function getNewPost(req, res) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).redirect('/auth/login');
  }

  res.render('posts/new', {
    values: {
      title: '',
      description: '',
      license: 'Sin copyright'
    }
  });
}

export async function postNewPost(req, res) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).redirect('/auth/login');
  }

  const body = req.body;
  const file = req.file; // Acá viene la foto

  // Armamos el objeto para que Zod lo valide
  const postData = {
    title: body.title,
    description: body.description,
    license: body.license,
    // Si hay archivo, armamos la ruta local. Si no, mandamos string vacío para que Zod salte
    imageUrl: file ? `/uploads/${file.filename}` : '' 
  };

  const validacion = postValidation(postData);

  try {
    if (validacion.success === false) {
      return res.status(400).render('posts/new', {
        values: body,
        alert: {
          status: 'error',
          text: buildValidationMessage(validacion),
        },
      });
    }

    // Si todo está OK, guardamos en Postgres
    await Post.create({
      title: postData.title,
      description: postData.description,
      imageUrl: postData.imageUrl,
      license: postData.license,
      userId: userId,
    });

    // Redireccionamos al home de Fotaza
    res.redirect('/');
    
  } catch (error) {
    console.error('Error al crear publicacion:', error);
    res.status(500).render('posts/new', {
      values: body,
      alert: {
        status: 'error',
        text: 'Hubo un error al guardar la foto en la base de datos.',
      },
    });
  }
}