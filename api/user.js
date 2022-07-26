import express from "express";
import { initializeApp } from "firebase/app";
import authenticate from "../middleware/authenticate.js";
import firebaseAdmin from "../services/firebase.js";
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword
} from "firebase/auth";
import { firebaseConfig } from "../services/firebaseConfig.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  res.status(200).json(req.user);
});

router.post("/signup", async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({
      error: "Please provide email, password and name for user"
    });
  }

  try {
    const newFirebaseUser = await firebaseAdmin.auth.createUser({
      email,
      password
    });

    if (newFirebaseUser) {
      const userCollection = req.app.locals.db.collection("user");
      const user = await userCollection.insertOne({
        email,
        name,
        firebaseId: newFirebaseUser.uid
      });

      const newUser = await userCollection.findOne(user._id);
      return res.status(201).json({
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        token: generateToken(newUser.firebaseId)
      });
    }
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      return res
        .status(400)
        .json({ error: `User with email: ${email} already exists` });
    }
    return res.status(500).json({ error: "Server error. Please try again" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Please provide email, password for user"
    });
  }
  try {
    const email_exists = await firebaseAdmin.auth.getUserByEmail(email);
    if (email_exists) {
      await signInWithEmailAndPassword(auth, email, password)
      const userData = await req.app.locals.db.collection("user").findOne({email})
      return res.status(200).json({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        token: generateToken(userData.firebaseId)
      })
    }
  } catch (error) {
    const message =
      error.code && error.code === "auth/user-not-found"
        ? `User with the email ${email} is not found`
        : error.code === "auth/wrong-password"
          ? "Invalid email or password"
          : error.toString();
    return res.status(400).json({ error: message });
  }
});

router.post("/passwordreset", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      error: "Please provide your email"
    });
  }
  try {
    await sendPasswordResetEmail(auth, email);
    return res.status(200).json({
      message: `Password reset sent to the ${email}, check your inbox or spam message`
    });
  } catch (error) {
    console.log(error);
  }
});

//Generate JWT
const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};

export default router;
