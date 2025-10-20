import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../utils/firebase";

const AdminSetup = () => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const createAdmin = async () => {
    setLoading(true);
    setStatus("Creating admin user...");

    try {
      const adminEmail = "admin@mansa.com";
      const adminPassword = "Admin123";

      // Try to create the admin user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminEmail,
        adminPassword
      );
      setStatus(
        `✅ Admin user created successfully! UID: ${userCredential.user.uid}`
      );

      // Sign out after creation
      await auth.signOut();
      setStatus("✅ Admin setup complete! You can now login.");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setStatus("ℹ️ Admin user already exists. Setup complete!");
      } else {
        setStatus(`❌ Error: ${error.message}`);
      }
    }

    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    setStatus("Testing admin login...");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        "admin@mansa.com",
        "Admin123"
      );
      setStatus(`✅ Login successful! UID: ${userCredential.user.uid}`);
      await auth.signOut();
    } catch (error) {
      setStatus(`❌ Login failed: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Setup</h1>

        <div className="space-y-4">
          <button
            onClick={createAdmin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating..." : "Create Admin User"}
          </button>

          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Testing..." : "Test Admin Login"}
          </button>
        </div>

        {status && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <p className="text-sm">{status}</p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p>
            <strong>Admin Credentials:</strong>
          </p>
          <p>Email: admin@mansa.com</p>
          <p>Password: Admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
