import express from "express";
import {
  getAllUsers,
  getMe,
  loginUser,
  regGoogleAuthData,
  registerUser,
  registerWithGoogle,
  resetPassword
} from "../controllers/userController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/regWithGoggleAuth", regGoogleAuthData);
router.post("/registerWithGoogle", registerWithGoogle);
router.post("/login", loginUser);
router.get("/user/:id", getMe);
router.get("/users/:id", getAllUsers);
router.post("/resetpassword", resetPassword);

export default router;
