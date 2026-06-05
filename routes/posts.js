import { Router } from "express";
const router = Router();

// Formulario para crear publicación
router.get('/new', (req, res) => {
  res.render('newPost');
});

// Guardar la publicación en la BD
router.post('/', (req, res) => {
  res.send('Acá guardamos la foto en la BD');
});

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