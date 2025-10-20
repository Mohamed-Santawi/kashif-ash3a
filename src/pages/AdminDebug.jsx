import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../utils/firebase";

const AdminDebug = () => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setStatus("Testing login...");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        "admin@mansa.com",
        "Admin123"
      );
      setStatus(`✅ Login successful! UID: ${userCredential.user.uid}`);
    } catch (error) {
      setStatus(`❌ Login failed: ${error.code} - ${error.message}`);
    }

    setLoading(false);
  };

  const createAdmin = async () => {
    setLoading(true);
    setStatus("Creating admin...");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        "admin@mansa.com",
        "Admin123"
      );
      setStatus(`✅ Admin created! UID: ${userCredential.user.uid}`);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setStatus("ℹ️ Admin already exists");
      } else {
        setStatus(`❌ Error: ${error.code} - ${error.message}`);
      }
    }

    setLoading(false);
  };

  const resetPassword = async () => {
    setLoading(true);
    setStatus("Resetting password...");

    try {
      // This will only work if the user exists
      await sendPasswordResetEmail(auth, "admin@mansa.com");
      setStatus("✅ Password reset email sent!");
    } catch (error) {
      setStatus(`❌ Error: ${error.code} - ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Debug</h1>

        <div className="space-y-4">
          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Testing..." : "Test Login"}
          </button>

          <button
            onClick={createAdmin}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>

          <button
            onClick={resetPassword}
            disabled={loading}
            className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Sending..." : "Send Password Reset"}
          </button>
        </div>

        {status && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <p className="text-sm">{status}</p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p>
            <strong>Test Credentials:</strong>
          </p>
          <p>Email: admin@mansa.com</p>
          <p>Password: Admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDebug;
