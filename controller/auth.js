import { User } from "../models/User.js";
import { userValidation } from "../helpers/validations.js";

export async function loginForm(req, res) {
  res.render('auth/login');
}

export async function login(req, res) {
  const { email, password } = req.body;
  const mail = email.trim();
  const pass = password.trim();

  let errores = {};
  if (!mail) errores.email = ["Por favor, ingresa tu correo electrónico."];
  if (!pass) errores.password = ["Por favor, ingresa tu contraseña."];

  if (Object.keys(errores).length > 0) {
    return res.status(400).render('auth/login', {
      errors: errores,
      formValues: req.body
    });
  }

  try {
    const user = await User.findOne({ where: { email: mail } });
    
    // Si el usuario no existe
    if (!user) {
      return res.status(400).render('auth/login', {
        errors: { email: ["El correo electrónico no coincide con ninguna cuenta."] },
        formValues: req.body
      });
    }

    const isValidated = await user.validatePassword(pass);

    // Si la contraseña no coincide
    if (!isValidated) {
      return res.status(400).render('auth/login', {
        errors: { password: ["La contraseña que ingresaste es incorrecta."] },
        formValues: req.body
      });
    }

    // Si está todo OK, creamos la sesión
    req.session.user = { id: user.id };
    
    // Forzamos el guardado asincrónico seguro
    return req.session.save((err) => {
      if (err) {
        console.log('[!] Error al guardar sesión: ', err);
        return res.status(500).render('auth/login', {
          alert: { status: "error", text: "Hubo un error al procesar la sesión." },
          formValues: req.body
        });
      }
      return res.redirect('/');
    });

  } catch (error) {
    console.log('[!] Error en login: ', error);
    return res.status(500).render('auth/login', {
      alert: { status: "error", text: "Hubo un error en el servidor al iniciar sesión." },
      formValues: req.body
    });
  }
}

export async function signupForm(req, res) {
  res.render('auth/signup');
}

export async function signup(req, res) {
  const validacion = userValidation(req.body);

  if (!validacion.success) {
    return res.status(400).render('auth/signup', {
      errors: validacion.errors, 
      formValues: req.body
    });
  }

  const { username, email, password } = req.body;

  try {
    await User.create({
      username: username.trim(),
      email: email.trim(),
      password: password.trim()
    });
  } catch (error) {
    console.log(error);
    return res.status(500).render('auth/signup', {
      alert: { status: "error", text: "Hubo un error al crear el usuario. Posible email duplicado." },
      formValues: req.body
    });
  }

  res.redirect('/auth/login');
}

export async function logout(req, res) {
  if (req.session) {
    await req.session.destroy();
    res.redirect('/auth/login');
  }
}