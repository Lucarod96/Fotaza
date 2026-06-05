import 'dotenv/config';
import express from 'express';

import authRouter from './routes/auth.js';
import postsRouter from './routes/posts.js';
import profileRouter from './routes/profile.js';

// CONSTANTES
const PORT = process.env.PORT;
const app = express();

// MIDDLEWARES
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MOTOR DE PLANTILLAS
app.set('view engine', 'pug');
app.set('views', './views');

// RUTAS
app.use('/', authRouter);
app.use('/posts', postsRouter);
app.use('/profile', profileRouter);

app.get('/', (req, res) => {
    res.render('index');
})

// SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});