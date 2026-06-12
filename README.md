# Fotaza 2 - Programación Web II

Aplicación web para almacenar, ordenar, buscar, vender y compartir fotografías en línea, desarrollada con Node.js, Express y Sequelize.

##  Requisitos previos
- **Node.js** instalado en el sistema.
- Servidor de base de datos **PostgreSQL** (o MySQL) en ejecución.

---

## Pasos obligatorios para ejecutar el proyecto en local

La aplicación puede clonarse, configurarse y ejecutarse siguiendo estrictamente estos pasos:

1. **Clonar el repositorio y acceder a la carpeta**
    ```Bash
    git clone https://github.com/Lucarod96/Fotaza
    cd Fotaza

2. **Instalar todas las dependencias necesarias**
    ```Bash
    npm install

3. **Ejecutar el mecanismo de inicialización de la base de datos**
    ```Bash
    npm run db:init

Este script se encargará de sincronizar las tablas e inyectar automáticamente los datos semilla (usuarios, publicaciones, etiquetas, valoraciones y comentarios) para realizar una prueba completa del sistema.

4. **Configurar las variables de entorno (.env)**

-Crear un archivo llamado .env en la raíz del proyecto.

-Copiar el contenido de la plantilla .env.example dentro del nuevo .env.

-Modificar las credenciales de conexión (puerto, usuario, contraseña, base de datos) para que coincidan con tu entorno local.

5. **Iniciar la aplicación**
    ```Bash
    npm start

---

🌐 **Acceso a la Aplicación**

Una vez iniciado el servidor, el proyecto queda accesible de manera local en:
👉 http://localhost:3000

⚠️ **Nota para la evaluación:** Al ingresar a la URL raíz (http://localhost:3000), el sistema maneja el ruteo interno y redirige de forma automática a http://localhost:3000/posts, que es donde se renderiza la cartelera principal con la grilla de imágenes públicas de la comunidad.

👥 **Usuarios de Prueba (Seeds)**

Para facilitar la corrección y evaluar las diferentes interacciones (comentarios, seguimientos y valoraciones cruzadas), el script de inicialización genera de forma automática las siguientes cuentas con contraseñas ya encriptadas:

**Usuario Común:**

Email / Usuario: user@test.com / user

Contraseña: pass123

**Administrador:**

Email / Usuario: admin@test.com / admin

Contraseña: pass123