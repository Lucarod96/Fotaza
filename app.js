import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import authRouter from './routes/auth.js';
import postsRouter from './routes/posts.js';
import profileRouter from './routes/profile.js';
// import { User } from './models/User.js';
import { connectDatabase } from './models/index.js';

// CONSTANTES
const PORT = process.env.PORT;
const app = express();

// MIDDLEWARES
app.use(express.static('public'));
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MOTOR DE PLANTILLAS
app.set('view engine', 'pug');
app.set('views', './views');

// RUTAS
app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/profile', profileRouter);

app.get('/', (req, res) => {
    res.render('index');
})

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

// // TEST DE CONEXIÓN A LA BASE DE DATOS
// try {
//     await sequelize.sync({ alter: true });
//     console.log('Conexión a PostgreSQL establecida con éxito!');
// } catch (error) {
//     console.error('Error al conectar con la base de datos:', error);
// }

// // SERVIDOR
// app.listen(PORT, () => {
//     console.log(`Servidor escuchando en el puerto ${PORT}`);
// });