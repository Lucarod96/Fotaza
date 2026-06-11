import { Router } from "express";
import { getMyProfile, getUserProfile } from "../controller/profile.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Ver mi propio perfil (Ruta raíz del módulo, protegida por logueo)
router.get('/', authMiddleware, getMyProfile);

// Ver el perfil de un usuario específico usando su @username
router.get('/:username', getUserProfile);

// Seguir / Dejar de seguir a un usuario
router.post('/:username/follow', authMiddleware, (req, res) => {
    res.send('Acá procesaremos el botón de seguir más adelante');
});

export default router;