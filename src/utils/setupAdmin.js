// Admin Setup Script
// Run this script once to create the admin user account
// You can run this in the browser console or create a temporary component

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./utils/firebase";

const setupAdmin = async () => {
  try {
    const adminEmail = "admin@mansa.com";
    const adminPassword = "Admin123";

    console.log("Creating admin user...");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    );
    console.log("✅ Admin user created successfully!");
    console.log("Admin UID:", userCredential.user.uid);
    console.log("Admin Email:", userCredential.user.email);

    // Sign out after creation
    await auth.signOut();
    console.log("✅ Admin setup complete!");
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log("ℹ️ Admin user already exists. Setup complete!");
    } else {
      console.error("❌ Error creating admin user:", error);
    }
  }
};

// Uncomment the line below to run the setup
// setupAdmin();

export default setupAdmin;
