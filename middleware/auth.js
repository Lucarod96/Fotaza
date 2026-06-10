import { User } from "../models/User.js";

export async function authMiddleware(req, res, next) {
  const user = req.session.user; // usuario de la sesion solo contiene id
  if(!user) {
    return res.redirect('/auth/login');
  }

  const userId = Number(user.id);

  try {
    const dbUser = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email'],
    });

    if (!dbUser) {
      return res.redirect('/auth/login');
    }

    req.user = dbUser;

    res.locals.currentUser = {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email
    };
  } catch (error) {
    console.error('[!] Error al autenticar usuario:', error);
    return res.status(500).redirect('/auth/login');
  }

  next();
}