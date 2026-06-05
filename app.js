import 'dotenv/config';
import express from 'express';
import nuevaPublicacionRouter from './routes/nuevaPublicacion.js';

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
app.use('/publicaciones', nuevaPublicacionRouter);

app.get('/', (req, res) => {
    res.render('index');
})



// SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});