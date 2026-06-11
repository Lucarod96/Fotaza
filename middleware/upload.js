import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  // Carpeta de destino
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); 
  },
  // Le cambiamos el nombre al archivo para que sea único (Fecha + nombre original)
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); 
  }
});

// Filtro de seguridad
const fileFilter = (req, file, cb) => {
  const permitidos = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (permitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato no válido. Solo se permiten imágenes."), false);
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});