import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";

// Function to create admin user (run this once to set up the admin account)
export const createAdminUser = async () => {
  try {
    const adminEmail = "admin@mansa.com";
    const adminPassword = "Admin123";

    // Try to create the admin user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    );
    console.log("Admin user created successfully:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log("Admin user already exists");
      // Try to sign in to verify the account exists
      try {
        const signInResult = await signInWithEmailAndPassword(
          auth,
          "admin@mansa.com",
          "Admin123"
        );
        console.log("Admin user verified:", signInResult.user.uid);
        return signInResult.user;
      } catch (signInError) {
        console.error("Error signing in admin:", signInError);
        throw signInError;
      }
    } else {
      console.error("Error creating admin user:", error);
      throw error;
    }
  }
};

// Function to verify admin credentials
export const verifyAdminCredentials = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error verifying admin credentials:", error);
    throw error;
  }
};
