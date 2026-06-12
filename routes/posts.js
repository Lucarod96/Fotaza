import { Router } from "express";
import { getNewPost, postNewPost, getHome, getPostDetail, postComment, postRate } from "../controller/post.js";
import { authMiddleware } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import multer from 'multer';

const router = Router();

// 1. Home / Feed principal
router.get('/', getHome);

// 2. Formulario para crear una nueva publicación
router.get('/new', authMiddleware, getNewPost);

// 3. Guardar la publicación en la BD (Protegido con Captura de errores de Multer)
router.post('/new', authMiddleware, (req, res, next) => {
    upload.array('images', 10)(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).render('posts/new', {
                    values: req.body,
                    alert: { 
                        status: 'error', 
                        text: '¡Una o más imágenes superan el tamaño máximo permitido de 10 MB!' 
                    }
                });
            }
            // Cualquier otro error propio de Multer 
            return res.status(400).render('posts/new', {
                values: req.body,
                alert: { status: 'error', text: `Error de subida: ${err.message}` }
            });
        } else if (err) {
            // Si ocurre un error inesperado del sistema
            return res.status(500).render('posts/new', {
                values: req.body,
                alert: { status: 'error', text: 'Hubo un problema inesperado al procesar las imágenes.' }
            });
        }
        
        // Si no hubo ningún error de tamaño o formato, avanzamos al controlador definitivo
        next();
    });
}, postNewPost);

// 4. Ver el detalle de una publicación específica y sus comentarios
router.get('/:id', getPostDetail);

// 5. Procesar el formulario de comentarios
router.post('/:id/comments', authMiddleware, postComment);

// 6. Procesar valoraciones con estrellitas
router.post('/:id/rate', authMiddleware, postRate);

export default router;