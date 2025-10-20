// Run this in browser console to create admin user
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./src/utils/firebase.js";

const createAdmin = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      "admin@mansa.com",
      "Admin123"
    );
    console.log("✅ Admin user created successfully!");
    console.log("UID:", userCredential.user.uid);
    console.log("Email:", userCredential.user.email);
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log("ℹ️ Admin user already exists");
    } else {
      console.error("❌ Error creating admin:", error);
    }
  }
};

// Uncomment the line below to run
// createAdmin();
