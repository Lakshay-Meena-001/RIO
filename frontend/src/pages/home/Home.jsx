import { useState } from "react";
import { MotionConfig } from "motion/react";
import Loginmodel from "../../components/auth/LoginModel.jsx";
import "./Home.css";
import HomeBackground from "../../components/home/HomeBackground.jsx";
import HomeDesktopNav from "../../components/home/HomeDesktopNav.jsx";
import HomeMobileNav from "../../components/home/HomeMobileNav.jsx";
import HomeHero from "../../components/home/HomeHero.jsx";
import HomeProductSection from "../../components/home/HomeProductSection.jsx";
import HomeHowItWorks from "../../components/home/HomeHowItWorks.jsx";
import HomeAgentsSection from "../../components/home/HomeAgentsSection.jsx";
import HomeAssessmentSection from "../../components/home/HomeAssessmentSection.jsx";
import HomeRoadmapSection from "../../components/home/HomeRoadmapSection.jsx";
import HomeFinalCta from "../../components/home/HomeFinalCta.jsx";
import HomeFooter from "../../components/home/HomeFooter.jsx";
import HomeMobileActionBar from "../../components/home/HomeMobileActionBar.jsx";
import { GlassLine } from "../../components/home/HomePrimitives.jsx";

export default function Home({ setUser, user }) {
  const [showLogin, setShowLogin] = useState(false);
  const [initialAuthMode, setInitialAuthMode] = useState("login");
  const [dismissedSetupUser, setDismissedSetupUser] = useState(null);

  const setupUserKey = user?._id ?? user?.id ?? user?.email ?? user;
  const needsAccountSetup = Boolean(
    user && !user.profileCompleted && setupUserKey !== dismissedSetupUser,
  );
  const isLoginOpen = showLogin || needsAccountSetup;

  const closeLogin = () => {
    setShowLogin(false);
    if (user && !user.profileCompleted) setDismissedSetupUser(setupUserKey);
  };

  const openLogin = () => {
    setInitialAuthMode("login");
    setShowLogin(true);
  };
  const openSignup = () => {
    setInitialAuthMode("register");
    setShowLogin(true);
  };

  const scrollToHowItWorks = () => {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="rio-home-page relative min-h-screen overflow-x-hidden bg-[#17191C] text-white">
        <HomeBackground />
        <HomeDesktopNav openLogin={openLogin} />
        <HomeMobileNav />
        <HomeHero
          openLogin={openLogin}
          scrollToHowItWorks={scrollToHowItWorks}
        />
        <HomeProductSection />
        <GlassLine />
        <HomeHowItWorks openLogin={openLogin} />
        <GlassLine />
        <HomeAgentsSection />
        <GlassLine />
        <HomeAssessmentSection />
        <GlassLine />
        <HomeRoadmapSection />
        <HomeFinalCta openLogin={openLogin} />
        <HomeFooter openLogin={openLogin} />
        <HomeMobileActionBar openLogin={openLogin} openSignup={openSignup} />
        {isLoginOpen && (
          <Loginmodel
            onClose={closeLogin}
            setUser={setUser}
            initialAccountSetupUser={user}
            initialAuthMode={initialAuthMode}
          />
        )}
      </main>
    </MotionConfig>
  );
}
