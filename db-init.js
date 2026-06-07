import 'dotenv/config';
import { syncDatabase } from './models/index.js';

console.log('Iniciando script de creación de tablas...');

syncDatabase()
    .then(() => {
        console.log('Proceso terminado con éxito!');
        process.exit(0); // Cierra el proceso indicando que todo salió bien
    })
    .catch((error) => {
        console.error('Fallo crítico al inicializar la base de datos.', error);
        process.exit(1); // Cierra el proceso indicando un error
    });