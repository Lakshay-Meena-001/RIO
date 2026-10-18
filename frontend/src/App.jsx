import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

// Existing pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import RoadmapDashboardPage from "./pages/roadmap/RoadmapDashboardPage";
import RoadmapBuilderPage from "./pages/roadmap/RoadmapBuilderPage";

import BillingDashboardPage from "./pages/billing/BillingDashboardPage";
import BillingHistoryPage from "./pages/billing/TransactionHistoryPage";
import BillingTransactionDetailsPage from "./pages/billing/BillingTransactionDetailsPage";

// Mock Interview pages
import InterviewDashboard from "./pages/InterviewDashboard";
import NewInterview from "./pages/NewInterview";
import LiveInterview from "./pages/LiveInterview";
import InterviewHistory from "./pages/InterviewHistory";

// APIs
import { getCurrentUser } from "./api/user.api";
import { getResume } from "./api/resume.api";

// Redux
import { setResume } from "./redux/resumeSlice";
import RoadmapHistoryPage from "./pages/roadmap/RoadmapHistoryPage";
import ScorerDashboard from "./pages/ScorerDashboard";
import ScorerHistory from "./pages/ScorerHistory";
import ScorerReport from "./pages/ScorerReport";
import ResumeBuilderDashboard from "./pages/ResumeBuilderDashboard";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeHistoryPage from "./pages/ResumeHistoryPage";

function LegacyRoadmapRedirect() {
  const { roadmapId } = useParams();

  return (
    <Navigate
      to={`/roadmap/history?roadmap=${encodeURIComponent(roadmapId)}`}
      replace
    />
  );
}

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
          GENERAL DASHBOARD
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
            <ScorerDashboard user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/scorer/history"
        element={<ScorerHistory user={user} setUser={setUser} />}
      />
      <Route
        path="/scorer/score-report"
        element={<ScorerReport user={user} setUser={setUser} />}
      />
      <Route
        path="/scorer/report"
        element={<ScorerReport user={user} setUser={setUser} />}
      />

      {/* ==================================================
          RESUME BUILDER DASHBOARD + EDITOR
      ================================================== */}
      <Route
        path="/builder/dashboard"
        element={
          isProtected ? (
            <ResumeBuilderDashboard user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
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
      <Route
        path="/builder/history"
        element={
          isProtected ? (
            <ResumeHistoryPage user={user} setUser={setUser} />
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
      {/* Permanent roadmap learning workspace */}
      <Route
        path="/roadmap/history"
        element={
          isProtected ? (
            <RoadmapHistoryPage user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      {/* Legacy roadmap URLs redirect into History */}
      <Route
        path="/roadmap/:roadmapId"
        element={
          isProtected ? <LegacyRoadmapRedirect /> : <Navigate to="/" replace />
        }
      />

      {/* ==================================================
          MOCK INTERVIEW
      ================================================== */}
      <Route
        path="/mock-interview"
        element={
          isProtected ? (
            <InterviewDashboard user={user} setUser={setUser} />
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
            <LiveInterview user={user} setUser={setUser} />
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
          BILLING
      ================================================== */}
      <Route
        path="/billing"
        element={
          isProtected ? (
            <BillingDashboardPage user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/billing/history"
        element={
          isProtected ? (
            <BillingHistoryPage user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/billing/transactions/:transactionId"
        element={
          isProtected ? (
            <BillingTransactionDetailsPage user={user} setUser={setUser} />
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
