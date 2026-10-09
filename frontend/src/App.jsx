import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

// Existing pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Scorer from "./pages/Scorer";
import ResumeBuilder from "./pages/ResumeBuilder";
import RoadmapDashboardPage from "./pages/roadmap/RoadmapDashboardPage";
import RoadmapBuilderPage from "./pages/roadmap/RoadmapBuilderPage";

// // Roadmap pages
// import RoadmapPage from "./pages/roadmap/RoadmapPage";
// import RoadmapDetailPage from "./pages/roadmap/RoadmapDetailPage";

// Mock Interview pages
import MockInterview from "./pages/MockInterview";
import NewInterview from "./pages/NewInterview";
import Interview from "./pages/Interview";
import InterviewHistory from "./pages/InterviewHistory";

// APIs
import { getCurrentUser } from "./api/user.api";
import { getResume } from "./api/resume.api";

// Redux
import { setResume } from "./redux/resumeSlice";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  // --------------------------------------------------
  // Fetch current user
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Fetch user's resume
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Initial loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
      </div>
    );
  }

  const isAuthenticated = Boolean(user);
  const isProfileComplete = user?.profileCompleted === true;

  const isProtected = isAuthenticated && isProfileComplete;

  return (
    <Routes>
      {/* ==================================================
          PUBLIC / HOME
      ================================================== */}

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

      {/* ==================================================
          DASHBOARD
      ================================================== */}

      <Route
        path="/dashboard"
        element={
          isProtected ? (
            <Dashboard user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ==================================================
          RESUME SCORER
      ================================================== */}

      <Route
        path="/scorer"
        element={
          isProtected ? (
            <Scorer user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ==================================================
          RESUME BUILDER
      ================================================== */}

      <Route
        path="/builder"
        element={
          isProtected ? (
            <ResumeBuilder user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ==================================================
    ROADMAP
================================================== */}
      <Route
        path="/roadmap"
        element={
          isProtected ? (
            <RoadmapDashboardPage user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/roadmap/new"
        element={
          isProtected ? (
            <RoadmapBuilderPage user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ==================================================
          MOCK INTERVIEW
      ================================================== */}

      <Route
        path="/mock-interview"
        element={
          isProtected ? (
            <MockInterview user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ==================================================
          NEW INTERVIEW
      ================================================== */}

      <Route
        path="/mock-interview/new"
        element={
          isProtected ? (
            <NewInterview user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ==================================================
          ACTIVE INTERVIEW
      ================================================== */}

      <Route
        path="/mock-interview/:interviewId"
        element={
          isProtected ? (
            <Interview user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ==================================================
          INTERVIEW HISTORY
      ================================================== */}

      <Route
        path="/mock-interview/history"
        element={
          isProtected ? (
            <InterviewHistory user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ==================================================
          FALLBACK
      ================================================== */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
