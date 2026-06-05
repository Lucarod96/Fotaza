import { Router } from "express";
const router = Router();

// Se muestran las vistas de Pug
router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

// Se procesan los formularios
router.post('/login', (req, res) => {
  res.send('Acá validaremos el login con la BD');
});

router.post('/signup', (req, res) => {
  res.send('Acá guardaremos el nuevo usuario');
});

export default router;