import { Router } from "express";
import { getNewPost, postNewPost } from "../controller/post.js";
import { authMiddleware } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Formulario para crear publicación
router.get('/new', authMiddleware, getNewPost);

// Guardar la publicación en la BD
router.post('/new', authMiddleware, upload.single('image'), postNewPost);

// Ver el detalle de una publicación específica
router.get('/:id', (req, res) => {
  res.render('publicationDetails');
});

// Procesar comentarios y valoraciones
router.post('/:id/comment', (req, res) => {
  res.send('Acá guardamos el comentario');
});

router.post('/:id/rate', (req, res) => {
  res.send('Acá guardamos las estrellitas');
});

export default router;