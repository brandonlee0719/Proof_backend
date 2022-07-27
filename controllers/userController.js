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

const getMe = async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization
    ? authorization.split("Bearer ").length
      ? authorization.split("Bearer ")[1]
      : null
    : null;
  console.log(token);

  if (token) {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    res.status(200).json(req.user);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = await db.collection("user").find({}).toArray();
    if (users) {
      return res.status(200).json(users);
    }
  } catch (error) {
    console.log(error);
  }
};

const registerUser = async (req, res) => {
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
      //   const token = await firebaseAdmin.auth.createCustomToken(
      //     newFirebaseUser.uid
      //   );
      const userCollection = req.app.locals.db.collection("user");
      const user = await userCollection.insertOne({
        email,
        name,
        firebaseId: newFirebaseUser.uid,
        surfingBalance: 0,
        advertisingBalance: 0
      });

      const newUser = await userCollection.findOne(user._id);
      return res.status(201).json({
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        surfingBalance: newUser.surfingBalance,
        advertisingBalance: newUser.advertisingBalance,
        token: generateToken(newUser._id)
      });
    }
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      return res
        .status(400)
        .json({ error: `User with email: ${email} already exists` });
    }
    return res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Please provide email, password for user"
    });
  }
  try {
    const email_exists = await firebaseAdmin.auth.getUserByEmail(email);
    if (email_exists) {
      //   const token = await firebaseAdmin.auth.createCustomToken(
      //     email_exists.uid
      //   );
      await signInWithEmailAndPassword(auth, email, password);
      const userData = await req.app.locals.db
        .collection("user")
        .findOne({ email });
      return res.status(200).json({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        surfingBalance: userData.surfingBalance,
        advertisingBalance: userData.advertisingBalance,
        token: generateToken(userData._id)
      });
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
};

const resetPassword = async (req, res) => {
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
};

//Generate JWT
const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};

export { registerUser, loginUser, resetPassword, getMe, getAllUsers };
