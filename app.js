import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import authRouter from './routes/auth.js';
import postsRouter from './routes/posts.js';
import profileRouter from './routes/profile.js';
import { connectDatabase } from './models/index.js';

// CONSTANTES
const PORT = process.env.PORT || 3000;
const app = express();

// CONFIGURACIÓN BÁSICA Y LECTURA DE DATOS
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MOTOR DE PLANTILLAS
app.set('view engine', 'pug');
app.set('views', './views');

// CONFIGURACIÓN DE LA SESIÓN
app.use(session({
    secret: process.env.SESSION_KEY || 'fotaza_secreto_super_seguro',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // en producción se cambia a true
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        httpOnly: true,
        sameSite: 'lax', 
    },
}));

// MIDDLEWARE GLOBAL DE USUARIO
app.use((req, res, next) => {
    if (req.session && req.session.user) {
        res.locals.currentUser = req.session.user; 
    } else {
        res.locals.currentUser = null;
    }
    next();
});

// RUTAS 
app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/profile', profileRouter);

app.get('/', (req, res) => {
    res.render('index');
});

// CONEXIÓN A BD Y ARRANQUE DEL SERVIDOR
connectDatabase()
    .then(() => {
        app.listen(PORT, (err) => {
            if(err) {
                console.error('[+] Error al iniciar el servidor:', err);
                return;
            }
            console.log(`[+] Servidor escuchando en el puerto ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('[+] Error sincronizando con bd:', err);
    });