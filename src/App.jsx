import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import NavigationGuard from "./components/NavigationGuard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterTest from "./pages/RegisterTest";
import ReportForm from "./pages/ReportForm";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Statistics from "./pages/Statistics";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSetup from "./pages/AdminSetup";
import AdminManagement from "./pages/AdminManagement";
import AdminDebug from "./pages/AdminDebug";
import NavigationTest from "./pages/NavigationTest";

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavigationGuard>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/register-test"
              element={
                <PublicRoute>
                  <RegisterTest />
                </PublicRoute>
              }
            />
            <Route
              path="/navigation-test"
              element={
                <PublicRoute>
                  <NavigationTest />
                </PublicRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/login"
              element={
                <PublicRoute>
                  <AdminLogin />
                </PublicRoute>
              }
            />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route
              path="/admin/setup"
              element={
                <PublicRoute>
                  <AdminSetup />
                </PublicRoute>
              }
            />
            <Route path="/admin/management" element={<AdminManagement />} />
            <Route
              path="/admin/debug"
              element={
                <PublicRoute>
                  <AdminDebug />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReportForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Notifications />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Statistics />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NavigationGuard>
      </Router>
    </AuthProvider>
  );
}

export default App;
