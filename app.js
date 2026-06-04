import 'dotenv/config';
import express from 'express';

// CONSTANTES
const PORT = process.env.PORT;

const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MOTOR DE PLANTILLAS
app.set('view engine', 'pug');
app.set('views', './views');

// RUTAS
app.get('/', (req, res) => {
    res.render('index');
})

// SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});