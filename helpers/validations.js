import * as z from "zod";

// ESQUEMA DE VALIDACIÓN PARA EL REGISTRO
const UserSchema = z.object({
    username: z.string({ required_error: "El nombre de usuario es requerido" })
        .min(3, "El usuario debe tener al menos 3 caracteres")
        .max(50, "El usuario no puede superar los 50 caracteres"),
    email: z.string({ required_error: "El email es requerido" })
        .email("Debe ser un correo electrónico válido"),
    password: z.string({ required_error: "La contraseña es requerida" })
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string({ required_error: "Confirmar la contraseña es requerido" })
}).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"]
});

// ESQUEMA DE VALIDACIÓN PARA PUBLICACIONES (Posts)
const PostSchema = z.object({
    title: z.string({ required_error: "El título es requerido" })
        .min(5, "El título debe tener como mínimo 5 caracteres")
        .max(100, "El título debe tener como máximo 100 caracteres"),
    description: z.string("La descripción debe ser un texto").optional(),
    tags: z.string({ required_error: "Debes ingresar al menos una etiqueta" })
        .min(2, "Debes ingresar al menos una etiqueta"),
    license: z.string("La licencia debe ser un texto").optional()
});

// FUNCIONES DE VALIDACIÓN EXPORTADAS - exportadas para ser usadas en rutas, controladores, etc
export function userValidation(user) {
    const resultado = UserSchema.safeParse(user);
    if (resultado.success === false) {
        return {
            success: false,
            errors: resultado.error.flatten().fieldErrors 
        };
    }
    return { success: true };
}

export function postValidation(post) {
    const resultado = PostSchema.safeParse(post);
    if (resultado.success === false) {
        return {
            success: false,
            errors: resultado.error.flatten().fieldErrors
        };
    }
    return { success: true };
}