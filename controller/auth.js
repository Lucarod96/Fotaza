import { User } from "../models/User.js";

export async function loginForm(req, res) {
  res.render('auth/login');
}

export async function login(req, res) {
  const { email, password } = req.body;
  const mail = email.trim();
  const pass = password.trim();

  if(!mail || !pass ){
    return res.status(400).render('auth/login', {
      alert: { status: "error", text: "Complete todos los campos" },
      formValues: req.body
    });
  }

  try {
    const user = await User.findOne({ where: { email: mail } });
    
    if(!user){
      return res.status(400).render('auth/login', {
        alert: { status: "error", text: "Usuario o contraseña incorrecta." },
        formValues: req.body
      });
    }

    const isValidated = await user.validatePassword(pass);

    if(!isValidated){
      return res.status(400).render('auth/login', {
        alert: { status: "error", text: "Usuario o contraseña incorrecta." },
        formValues: req.body
      });
    }

    // Si está todo OK, guardamos el ID en la sesión
    req.session.user = { id: user.id };
    
  } catch (error) {
    console.log('[!] Error en login: ', error);
    return res.status(500).render('auth/login', {
      alert: { status: "error", text: "Hubo un error al iniciar sesión" },
      formValues: req.body
    });
  }

  // si esta todo ok => luego de redirecciona al home
  res.redirect('/');
}

export async function signupForm(req, res) {
  res.render('auth/signup');
}

export async function signup(req, res) {
  const { username, email, password, confirmPassword } = req.body;

  const userName = username.trim();
  const mail = email.trim();
  const pass = password.trim();
  const confirmPass = confirmPassword.trim();

  if(!userName || !mail || !pass || !confirmPass){
    return res.status(400).render('auth/signup', {
      alert: { status: "error", text: "No deben haber campos vacíos" },
      formValues: req.body
    });
  }

  if(pass !== confirmPass){
    return res.status(400).render('auth/signup', {
      alert: { status: "error", text: "Las contraseñas no coinciden" },
      formValues: req.body
    });
  }

  try {
    const user = await User.create({
      username: userName,
      email: mail,
      password: pass
    });
  } catch (error) {
    console.log(error);
    res.status(500).render('auth/signup', {
      alert: {
        status: "error",
        text: "Hubo un error al crear el usuario."
      },
      formValues: req.body
    });
    return;
  }

  // si esta todo ok => luego de redirecciona al home
  res.redirect('/auth/login');
}

export async function logout(req, res) {
  if(req.session){
    await req.session.destroy();
    res.redirect('/auth/login');
  }
}