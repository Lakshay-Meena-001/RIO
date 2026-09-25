import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Scorer from "./pages/Scorer";

import { getCurrentUser } from "./api/user.api";
import { getResume } from "./api/resume.api";

import { setResume } from "./redux/resumeSlice";
import ResumeBuilder from "./pages/ResumeBuilder";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  // -----------------------------
  // 1. Get currently logged-in user
  // -----------------------------
  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await getCurrentUser();

        setUser(data?.user || null);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  // -----------------------------
  // 2. Fetch user's existing resume
  // -----------------------------
  useEffect(() => {
    if (!user) return;

    const getResumeData = async () => {
      try {
        const result = await getResume();

        if (result?.success && result?.data) {
          dispatch(setResume(result.data));
        }
      } catch (error) {
        console.error("Failed to fetch resume:", error);
      }
    };

    getResumeData();
  }, [user, dispatch]);

  // -----------------------------
  // App loading
  // -----------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#17191C] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#52525E] border-t-white animate-spin" />
      </div>
    );
  }

  const isAuthenticated = Boolean(user);
  const isProfileComplete = user?.profileCompleted === true;

  return (
    <Routes>
      {/* HOME */}
      <Route
        path="/"
        element={
          isProfileComplete ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Home user={user} setUser={setUser} />
          )
        }
      />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated && isProfileComplete ? (
            <Dashboard user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* RESUME SCORER */}
      <Route
        path="/scorer"
        element={
          isAuthenticated && isProfileComplete ? (
            <Scorer user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* RESUME BUILDER */}
      <Route
        path="/builder"
        element={
          isAuthenticated && isProfileComplete ? (
            <ResumeBuilder user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Future routes will be added here */}
    </Routes>
  );
};

export default App;