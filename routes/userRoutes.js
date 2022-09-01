import express from "express";
import {
  getAllUsers,
  getMe,
  loginUser,
  regGoogleAuthData,
  registerUser,
  registerWithGoogle,
  resetPassword,
  updateSurfingBalance,
  depositFund
} from "../controllers/userController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/regWithGoggleAuth", regGoogleAuthData);
router.post("/registerWithGoogle", registerWithGoogle);
router.post("/login", loginUser);
router.get("/user", getMe);
router.get("/users", getAllUsers);
router.post("/resetpassword", resetPassword);
router.put("/updateSurfingBalance/:id", updateSurfingBalance);
router.put("/depositFund", depositFund);

export default router;
