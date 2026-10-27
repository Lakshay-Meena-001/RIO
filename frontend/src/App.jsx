import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";

// Existing pages
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import ProgressPage from "./pages/progress/ProgressPage";
import RoadmapDashboardPage from "./pages/roadmap/RoadmapDashboardPage";
import RoadmapBuilderPage from "./pages/roadmap/RoadmapBuilderPage";

import BillingDashboardPage from "./pages/billing/BillingDashboardPage";
import TransactionHistoryPage from "./pages/billing/TransactionHistoryPage";
import BillingTransactionDetailsPage from "./pages/billing/BillingTransactionDetailsPage";

// Mock Interview pages
import InterviewDashboard from "./pages/interview/InterviewDashboard";
import NewInterview from "./pages/interview/NewInterview";
import LiveInterview from "./pages/interview/LiveInterview";
import InterviewHistory from "./pages/interview/InterviewHistory";

// APIs
import { getCurrentUser } from "./api/user/user.api";
import { getResumes } from "./api/resume/resume.api";

// Redux
import { setResume } from "./redux/resumeSlice";
import RoadmapHistoryPage from "./pages/roadmap/RoadmapHistoryPage";
import ScorerDashboard from "./pages/scorer/ScorerDashboard";
import ScorerHistory from "./pages/scorer/ScorerHistory";
import ScorerReport from "./pages/scorer/ScorerReport";
import ResumeBuilderDashboard from "./pages/resume/ResumeBuilderDashboard";
import ResumeBuilder from "./pages/resume/ResumeBuilder";
import ResumeHistoryPage from "./pages/resume/ResumeHistoryPage";
import ProfilePage from "./pages/home/ProfilePage";
import AccountSettingsPage from "./pages/home/AccountSettingsPage";

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
  const location = useLocation();

  // Fetch current user

  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await getCurrentUser();

        setUser(data?.user || null);
      } catch (error) {
        if (![401, 404].includes(error?.response?.status)) {
          console.error("Failed to fetch current user:", error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  // Fetch user's resume

  useEffect(() => {
    if (!user) return;

    const getResumeData = async () => {
      try {
        // Load the user's resume collection once; an empty collection is a normal
        // state for new accounts and must not trigger the legacy /get-resume 404.
        const result = await getResumes();
        const payload = result?.data ?? result;
        const resumes = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.resumes)
            ? payload.resumes
            : [];
        if (resumes.length > 0) {
          dispatch(setResume(resumes[0]));
        }
      } catch (error) {
        console.error("Failed to fetch resumes:", error);
      }
    };

    getResumeData();
  }, [user, dispatch]);

  // Initial loading

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
    <>
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 4500,
          className: "rio-toast",
          success: {
            duration: 3500,
            iconTheme: { primary: "#78b89a", secondary: "#111112" },
          },
          error: {
            duration: 6500,
            iconTheme: { primary: "#e07e79", secondary: "#111112" },
          },
        }}
      />
      <div key={location.pathname} className="rio-route-enter">
        <Routes location={location}>
          {/* 
          PUBLIC / HOME
      */}
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
          {/* 
          GENERAL DASHBOARD
       */}
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
          {/* 
          PROGRESS OVERVIEW
       */}
          <Route
            path="/progress"
            element={
              isProtected ? (
                <ProgressPage user={user} setUser={setUser} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/*
          RESUME SCORER
       */}
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
            element={
              isProtected ? (
                <ScorerHistory user={user} setUser={setUser} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/scorer/score-report"
            element={
              isProtected ? (
                <ScorerReport user={user} setUser={setUser} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/scorer/report"
            element={
              isProtected ? (
                <ScorerReport user={user} setUser={setUser} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/*
          RESUME BUILDER DASHBOARD + EDITOR
     */}
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

          {/* 
    ROADMAP
 */}
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
              isProtected ? (
                <LegacyRoadmapRedirect />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/*
          MOCK INTERVIEW
      */}
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
          {/* 
          NEW INTERVIEW
       */}
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
          {/*
          ACTIVE INTERVIEW
      */}
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
          {/*
          INTERVIEW HISTORY
       */}
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

          {/* 
          BILLING
      */}
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
                <TransactionHistoryPage user={user} setUser={setUser} />
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

          {/* 
          PROFILE
   */}
          <Route
            path="/profile"
            element={
              isProtected ? (
                <ProfilePage user={user} setUser={setUser} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/settings"
            element={
              isProtected ? (
                <AccountSettingsPage user={user} setUser={setUser} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/*
          FALLBACK
      */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
