import { Router } from "express";
import { getMyProfile, getUserProfile, toggleFollow } from "../controller/profile.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Ver mi propio perfil (Ruta raíz del módulo, protegida por logueo)
router.get('/', authMiddleware, getMyProfile);

// Ver el perfil de un usuario específico usando su @username
router.get('/:username', getUserProfile);

// 2. Conectamos la ruta POST con la lógica real del controlador
router.post('/:username/follow', authMiddleware, toggleFollow);

export default router;