import { initializeApp } from "firebase/app";
import authenticate from "../middleware/authenticate.js";
import firebaseAdmin from "../services/firebase.js";
import {
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  where
} from "firebase/firestore";
import { firebaseConfig } from "../services/firebaseConfig.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

const getMe = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const token = authorization
      ? authorization.split("Bearer ").length
        ? authorization.split("Bearer ")[1]
        : null
      : null;
    console.log(token);
    if (token) {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (user) {
        const email = user.id.email;
        const name = user.id.name;
        const db = req.app.locals.db;
        const userCollection = await db.collection("user").findOne({ email });
        return res.status(200).json({ user: userCollection });
      }
    } else {
      return res.status(500).json({ error: "Token not found" });
    }
  } catch (error) {
    const message = error.toString();
    return res.status(400).json({ error: message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const token = authorization
      ? authorization.split("Bearer ").length
        ? authorization.split("Bearer ")[1]
        : null
      : null;
    console.log(token);
    if (token) {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (user) {
        const db = req.app.locals.db;
        const allUsers = await db.collection("user").find({}).toArray();
        return res.status(200).json({ users: allUsers });
      }
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
      const payload = {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        surfingBalance: newUser.surfingBalance,
        advertisingBalance: newUser.advertisingBalance
      };
      const token = await generateToken(payload);
      if (token) {
        return res.status(201).json({ token: token });
      } else {
        return res.status(400).json("Unable to generate token");
      }
      // return res.status(201).json({
      //   id: newUser._id,
      //   name: newUser.name,
      //   email: newUser.email,
      //   surfingBalance: newUser.surfingBalance,
      //   advertisingBalance: newUser.advertisingBalance,
      //   token: generateToken(newUser._id)
      // });
    }
  } catch (error) {
    const message =
      error.code && error.code === "auth/email-already-exists"
        ? `User with email: ${email} already exists`
        : error.toString();
    return res.status(400).json({ error: message });
  }
};

const regGoogleAuthData = async (req, res) => {
  const { email, name, uid, surfingBalance, advertisingBalance } = req.body;

  if (!email || !name || !uid || !surfingBalance || !advertisingBalance) {
    return res.status(400).json({
      error:
        "Please provide email, name, uid, surfingBalance, advertisingBalance for user"
    });
  }
  try {
    const userCollection = req.app.locals.db.collection("user");
    const user_exists = await userCollection.findOne({ email });
    if (user_exists) {
      const payload = {
        id: user_exists._id,
        name: user_exists.name,
        email: user_exists.email,
        surfingBalance: user_exists.surfingBalance,
        advertisingBalance: user_exists.advertisingBalance
      };
      console.log(payload);
      const token = await generateToken(payload);
      return res.status(200).json({ token: token });
    } else {
      const user = await userCollection.insertOne({
        email,
        name,
        firebaseId: uid,
        surfingBalance,
        advertisingBalance
      });
      const newUser = await userCollection.findOne(user._id);
      const payload = {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        surfingBalance: newUser.surfingBalance,
        advertisingBalance: newUser.advertisingBalance
      };
      const token = await generateToken(payload);
      if (token) {
        return res.status(201).json({ token: token });
      } else {
        return res.status(400).json("Unable to generate token");
      }
    }
  } catch (error) {
    const message = error.toString();
    return res.status(400).json({ error: message });
  }
};

const registerWithGoogle = async (req, res) => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name: user.displayName,
        authProvider: "google",
        email: user.email
      });
    }
    const userCollection = req.app.locals.db.collection("user");
    const data = await userCollection.insertOne({
      email: user.email,
      name: user.displayName,
      firebaseId: user.uid,
      surfingBalance: 0,
      advertisingBalance: 0
    });

    const newUser = await userCollection.findOne(data._id);
    const payload = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      surfingBalance: newUser.surfingBalance,
      advertisingBalance: newUser.advertisingBalance
    };
    const token = await generateToken(payload);
    if (token) {
      return res.status(201).json({ token: token });
    } else {
      return res.status(400).json("Unable to generate token");
    }
    // return res.status(201).json({
    //   id: newUser._id,
    //   name: newUser.name,
    //   email: newUser.email,
    //   surfingBalance: newUser.surfingBalance,
    //   advertisingBalance: newUser.advertisingBalance,
    //   token: generateToken(newUser._id)
    // });
  } catch (error) {
    console.error(error);
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
    const db = req.app.locals.db;
    const user = await db.collection("user").findOne({ email });
    await signInWithEmailAndPassword(auth, email, password);
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      surfingBalance: user.surfingBalance,
      advertisingBalance: user.advertisingBalance
    };
    const token = await generateToken(payload);
    if (token) {
      return res.status(201).json({ token: token });
    } else {
      return res.status(400).json("Unable to generate token");
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

//Update surfing balance
const updateSurfingBalance = async (req, res) => {
  try {
    const _id = req.params.id;
    const { authorization } = req.headers;
    const { surfingAmount } = req.body;
    const token = authorization
      ? authorization.split("Bearer ").length
        ? authorization.split("Bearer ")[1]
        : null
      : null;
    if (token) {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (user) {
        const email = user.id.email;
        const db = req.app.locals.db;
        const ads = await db.collection("Ads").findOne({ _id: ObjectId(_id) });
        if(Number(ads.escrowAmount) < Number(surfingAmount)) {
          return res.status(401).json({error: "Your escrow amount is insufficient. Please escrow your bill first."})
        } else {
          const user_collection = await db.collection("user").findOne({ email: email });
          await db.collection('Ads').updateOne(
            { _id: ObjectId(_id) },
            {
              $set: {
                escrowAmount: Number(ads.escrowAmount) - Number(surfingAmount),
                isPublished: Number(ads.escrowAmount) == Number(surfingAmount) ? false : true
              }
            }
          );

          await db.collection("user").updateOne(
            { email: email },
            {
              $set: {
                surfingBalance: Number(user_collection.surfingBalance) + Number(surfingAmount)
              }
            }
          );
          return res.status(200).json({ message: "surfingBalance was successfully updated" });
        }   
      } else {
        return res.status(400).json({ error: "Verification failed!" });
      }
    } else {
      return res.status(404).json({ error: "Token not found" });
    }
  } catch(error) {

  }
}

//Deposit fund
const depositFund = async () => {
  try {
    const { authorization } = req.headers;
    const { depositAmount } = req.body;
    const token = authorization
      ? authorization.split("Bearer ").length
        ? authorization.split("Bearer ")[1]
        : null
      : null;
    if (token) {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (user) {
        const email = user.id.email;
        const db = req.app.locals.db;
        const user_collection = await db.collection("user").findOne({ email: email });

        await db.collection("user").updateOne(
          { email: email },
          {
            $set: {
              advertisingBalance: Number(user_collection.advertisingBalance) + Number(depositAmount)
            }
          }
        );
        return res.status(200).json({ message: "depositAmount was successfully updated" });
      } else {
        return res.status(400).json({ error: "Verification failed!" });
      }
    } else {
      return res.status(404).json({ error: "Token not found" });
    }
  } catch(error) {

  }
}

//Generate JWT
const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};

export {
  registerUser,
  regGoogleAuthData,
  registerWithGoogle,
  loginUser,
  resetPassword,
  getMe,
  getAllUsers,
  updateSurfingBalance,
  depositFund
};
