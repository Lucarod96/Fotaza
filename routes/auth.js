import { Router } from "express";
import { login, loginForm, logout, signup, signupForm } from "../controller/auth.js";

const authRouter = Router();

authRouter.get('/login', loginForm);
authRouter.post('/login', login);
authRouter.get('/signup', signupForm);
authRouter.post('/signup', signup);
authRouter.post('/logout', logout);

export default authRouter;