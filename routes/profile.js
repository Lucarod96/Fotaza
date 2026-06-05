import { Router } from "express";
const router = Router();

// Ver perfil de un usuario
router.get('/:id', (req, res) => {
  res.render('profile');
});

// Seguir a un usuario
router.post('/:id/follow', (req, res) => {
  res.send('Acá procesamos el botón de seguir');
});

export default router;