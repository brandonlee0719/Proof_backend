import express from "express";
import authenticate from "../middleware/authenticate.js";
import firebaseAdmin from "../services/firebase.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  res.status(200).json(req.user);
});

router.post("/", async (req, res) => {
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
      await userCollection.insertOne({
        email,
        name,
        firebaseId: newFirebaseUser.uid
      });
    }
    return res
      .status(200)
      .json({ success: "Account created successfully. Please sign in" });
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      return res
        .status(400)
        .json({ error: `User with email: ${email} already exists` });
    }
    return res.status(500).json({ error: "Server error. Please try again" });
  }
});

export default router