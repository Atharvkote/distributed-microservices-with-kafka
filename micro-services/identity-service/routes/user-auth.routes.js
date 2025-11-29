import { Router } from "express";
import {
  LoginController,
  SignUpController,
  OauthController,
  CheckAuthorization,
  LogOutController,
} from "../controllers/user-auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const userAuthRouter = Router();

// User Auth Routes
userAuthRouter.post("/login", LoginController);
userAuthRouter.post("/signup", SignUpController);
userAuthRouter.post("/logout", LogOutController);

// Oauth Rotues
userAuthRouter.post("/oAuth", OauthController);

// Check Auth Rotue
userAuthRouter.post("/check-auth", authMiddleware , CheckAuthorization);


export default userAuthRouter;
