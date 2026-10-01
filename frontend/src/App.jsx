import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Scorer from "./pages/Scorer";
import ResumeBuilder from "./pages/ResumeBuilder";

// Mock Interview pages
import MockInterview from "./pages/MockInterview";
import NewInterview from "./pages/NewInterview";
import Interview from "./pages/Interview";
import InterviewHistory from "./pages/InterviewHistory";

import { getCurrentUser } from "./api/user.api";
import { getResume } from "./api/resume.api";

import { setResume } from "./redux/resumeSlice";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

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
      {/* -------------------------------------------------- */}
      {/* Public / Home */}
      {/* -------------------------------------------------- */}

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

      {/* -------------------------------------------------- */}
      {/* Dashboard */}
      {/* -------------------------------------------------- */}

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

      {/* -------------------------------------------------- */}
      {/* Resume Scorer */}
      {/* -------------------------------------------------- */}

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

      {/* -------------------------------------------------- */}
      {/* Resume Builder */}
      {/* -------------------------------------------------- */}

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

      {/* -------------------------------------------------- */}
      {/* Mock Interview */}
      {/* -------------------------------------------------- */}

      <Route
        path="/mock-interview"
        element={
          isAuthenticated && isProfileComplete ? (
            <MockInterview user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* -------------------------------------------------- */}
      {/* New Interview Configuration */}
      {/* -------------------------------------------------- */}

      <Route
        path="/mock-interview/new"
        element={
          isAuthenticated && isProfileComplete ? (
            <NewInterview user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* -------------------------------------------------- */}
      {/* Active Interview */}
      {/* -------------------------------------------------- */}

      <Route
        path="/mock-interview/:interviewId"
        element={
          isAuthenticated && isProfileComplete ? (
            <Interview user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* --------------------------------------------------
    Interview History
-------------------------------------------------- */}

      <Route
        path="/mock-interview/history"
        element={
          isAuthenticated && isProfileComplete ? (
            <InterviewHistory user={user} setUser={setUser} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
    </Routes>
  );
};

export default App;
