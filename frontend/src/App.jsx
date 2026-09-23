import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { getCurrentUser } from "./api/user.api";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const data = await getCurrentUser();

      setUser(data?.user || null);
      setLoading(false);
    };

    getUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#17191C] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#52525B] border-t-white animate-spin" />
      </div>
    );
  }

  const isAuthenticated = Boolean(user);
  const isProfileComplete = user?.profileCompleted === true;

  return (
    <Routes>
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
    </Routes>
  );
};

export default App;
