import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import "./pages/resume/resume-builder.css";

// Existing pages
const Home = lazy(() => import("./pages/home/Home"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const ProgressPage = lazy(() => import("./pages/progress/ProgressPage"));
const RoadmapDashboardPage = lazy(
  () => import("./pages/roadmap/RoadmapDashboardPage"),
);
const RoadmapBuilderPage = lazy(
  () => import("./pages/roadmap/RoadmapBuilderPage"),
);
const BillingDashboardPage = lazy(
  () => import("./pages/billing/BillingDashboardPage"),
);
const TransactionHistoryPage = lazy(
  () => import("./pages/billing/TransactionHistoryPage"),
);
const BillingTransactionDetailsPage = lazy(
  () => import("./pages/billing/BillingTransactionDetailsPage"),
);
// Mock Interview pages
const InterviewDashboard = lazy(
  () => import("./pages/interview/InterviewDashboard"),
);
const NewInterview = lazy(() => import("./pages/interview/NewInterview"));
const LiveInterview = lazy(() => import("./pages/interview/LiveInterview"));
const InterviewHistory = lazy(
  () => import("./pages/interview/InterviewHistory"),
);
// APIs
import { getCurrentUser } from "./api/user/user.api";
import { getResumes } from "./api/resume/resume.api";

// Redux
import { setResume } from "./redux/resumeSlice";
const RoadmapHistoryPage = lazy(
  () => import("./pages/roadmap/RoadmapHistoryPage"),
);
const ScorerDashboard = lazy(() => import("./pages/scorer/ScorerDashboard"));
const ScorerHistory = lazy(() => import("./pages/scorer/ScorerHistory"));
const ScorerReport = lazy(() => import("./pages/scorer/ScorerReport"));
const ResumeBuilderDashboard = lazy(
  () => import("./pages/resume/ResumeBuilderDashboard"),
);
const ResumeBuilder = lazy(() => import("./pages/resume/ResumeBuilder"));
const ResumeHistoryPage = lazy(
  () => import("./pages/resume/ResumeHistoryPage"),
);
const ProfilePage = lazy(() => import("./pages/home/ProfilePage"));
const AccountSettingsPage = lazy(
  () => import("./pages/home/AccountSettingsPage"),
);
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

  // Fetch the user's resume collection when the account changes, not whenever
  // another part of the user object (for example, balance) is refreshed.
  const currentUserId =
    user?.userId || user?._id || user?.id || user?.email || null;

  useEffect(() => {
    if (!currentUserId) return;

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
  }, [currentUserId, dispatch]);

  // Initial loading

  if (loading) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
        </div>
      </>
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
      <div className="rio-route-enter">
        <Suspense
          fallback={
            <div
              className="rio-route-skeleton"
              role="status"
              aria-label="Loading page"
            >
              <span className="sr-only">Loading page…</span>
              <div className="rio-route-skeleton__sidebar" aria-hidden="true" />
              <div className="rio-route-skeleton__content" aria-hidden="true">
                <div className="rio-route-skeleton__line rio-route-skeleton__line--title" />
                <div className="rio-route-skeleton__line rio-route-skeleton__line--subtitle" />
                <div className="rio-route-skeleton__stats">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <div className="rio-route-skeleton__panel" />
              </div>
            </div>
          }
        >
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
                  <BillingTransactionDetailsPage
                    user={user}
                    setUser={setUser}
                  />
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
        </Suspense>
      </div>
    </>
  );
};

export default App;
