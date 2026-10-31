import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useWatch } from "react-hook-form";

import {
  FiArrowLeft,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiMail,
  FiCheck,
  FiPhone,
} from "react-icons/fi";
import {
  signInWithPopup,
  linkWithCredential,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  signOut,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { auth, provider, githubProvider } from "../../utils/firebase";
import api from "../../utils/axios";

import EmailVerification from "./EmailVerification";
import AuthModalFrame from "./AuthModalFrame";
import AuthBrandPanel from "./AuthBrandPanel";

const Loginmodel = ({
  onClose,
  setUser,
  initialAccountSetupUser = null,
  initialAuthMode = "login",
}) => {
  const recaptchaVerifierRef = useRef(null);
  const pendingProfileDataRef = useRef(null);

  // Lock background scrolling while the modal is mounted, without disabling
  // touch scrolling inside the modal's own scrollable auth panel.
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY;
    const previousBody = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    const previousHtmlOverflow = html.style.overflow;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    return () => {
      body.style.position = previousBody.position;
      body.style.top = previousBody.top;
      body.style.left = previousBody.left;
      body.style.right = previousBody.right;
      body.style.width = previousBody.width;
      body.style.overflow = previousBody.overflow;
      html.style.overflow = previousHtmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, []);

  const [authMode, setAuthMode] = useState(initialAuthMode);
  const [method, setMethod] = useState("email");
  const [accountSetupStep, setAccountSetupStep] = useState(() =>
    Boolean(
      initialAccountSetupUser && !initialAccountSetupUser.profileCompleted,
    ),
  );

  const [accountSetupUser, setAccountSetupUser] = useState(() =>
    initialAccountSetupUser && !initialAccountSetupUser.profileCompleted
      ? initialAccountSetupUser
      : null,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [otpStep, setOtpStep] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otp, setOtp] = useState("");
  // const [phoneLinkConfirmation, setPhoneLinkConfirmation] = useState(null);
  // const [phoneLinkOtp, setPhoneLinkOtp] = useState("");
  // const [phoneLinkSent, setPhoneLinkSent] = useState(false);

  const [emailVerificationStep, setEmailVerificationStep] = useState(false);
  const [passwordCreationStep, setPasswordCreationStep] = useState(false);

  const [passwordResetStep, setPasswordResetStep] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  const [verificationEmail, setVerificationEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const [forgotPasswordError, setForgotPasswordError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = useWatch({
    control,
    name: "newPassword",
  });
  const emailValue =
    useWatch({ control, name: "email", defaultValue: "" }) || "";
  const passwordValue =
    useWatch({ control, name: "password", defaultValue: "" }) || "";
  const nameValue = useWatch({ control, name: "name", defaultValue: "" }) || "";

  useEffect(() => {
    if (!accountSetupStep) return;
    const authenticatedEmail =
      auth.currentUser?.email || accountSetupUser?.email || "";
    if (authenticatedEmail)
      setValue("email", authenticatedEmail, { shouldValidate: true });
    if (accountSetupUser?.name) setValue("name", accountSetupUser.name);
  }, [accountSetupStep, accountSetupUser, setValue]);

  // Supports both:
  const normalizeEmail = (value) => {
    const email = value?.trim().toLowerCase();

    if (!email) {
      return "";
    }

    return email.includes("@") ? email : `${email}@gmail.com`;
  };

  const clearRecaptchaVerifier = () => {
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }
  };
  // Clears every temporary Firebase phone-auth state.
  const clearPhoneOtpSession = () => {
    clearRecaptchaVerifier();

    setOtpStep(false);
    setConfirmationResult(null);
    setOtp("");
  };

  const handleClose = () => {
    if (isLoading || accountSetupStep) return;

    clearPhoneOtpSession();
    onClose();
  };

  // Complete the same RIO login flow after a social sign-in or provider link.
  // All Firebase providers must resolve to one Firebase UID, which is the
  // identity used by the backend to find the corresponding MongoDB account.
  const finishSocialSignIn = async (
    firebaseUser,
    successMessage = "Welcome back!",
  ) => {
    const token = await firebaseUser.getIdToken(true);
    const response = await api.post("/api/auth/login", { token });
    const user = response.data?.user;

    if (!user) {
      throw new Error("User information was not returned.");
    }

    if (user.profileCompleted) {
      toast.success(successMessage);
      setUser(user);
      onClose();
      return;
    }

    toast.success("Account created. Let's complete your profile.");
    setUser(user);
    setAccountSetupUser({
      ...user,
      email: firebaseUser.email || user.email || "",
      emailVerified: firebaseUser.emailVerified === true,
      phoneNumber: firebaseUser.phoneNumber || user.phoneNumber || "",
      phoneVerified: Boolean(firebaseUser.phoneNumber),
    });
    setAccountSetupStep(true);
  };

  const handleSocialAuth = async (socialProvider, providerName) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      try {
        const result = await signInWithPopup(auth, socialProvider);
        await finishSocialSignIn(result.user);
      } catch (error) {
        // Firebase blocks a second account with the same email. Authenticate
        // the existing Google identity, then explicitly link GitHub to it.
        // This preserves one Firebase UID (and therefore one RIO/Mongo user).
        if (
          providerName !== "GitHub" ||
          error?.code !== "auth/account-exists-with-different-credential"
        ) {
          throw error;
        }

        const pendingGithubCredential =
          GithubAuthProvider.credentialFromError(error);

        if (!pendingGithubCredential) {
          throw new Error(
            "GitHub sign-in needs account verification, but Firebase did not return the pending credential. Please try again.",
            { cause: error },
          );
        }

        toast(
          "This email already has a RIO account. Sign in with its Google account to connect GitHub.",
        );

        const googleResult = await signInWithPopup(auth, provider);
        const expectedEmail = String(
          error?.customData?.email || error?.email || "",
        )
          .trim()
          .toLowerCase();
        const googleEmail = String(googleResult.user.email || "")
          .trim()
          .toLowerCase();

        // Never attach a GitHub identity to a different Google account just
        // because another Google account is active in the browser.
        if (expectedEmail && googleEmail !== expectedEmail) {
          await signOut(auth);
          throw new Error(
            `Please choose the Google account that uses ${expectedEmail} to connect GitHub.`,
            { cause: error },
          );
        }

        try {
          const linkedResult = await linkWithCredential(
            googleResult.user,
            pendingGithubCredential,
          );
          await finishSocialSignIn(
            linkedResult.user,
            "GitHub connected to your existing RIO account.",
          );
        } catch (linkError) {
          if (linkError?.code === "auth/provider-already-linked") {
            await finishSocialSignIn(
              googleResult.user,
              "Welcome back! Your GitHub account is already connected.",
            );
            return;
          }
          if (linkError?.code === "auth/credential-already-in-use") {
            throw new Error(
              "This GitHub account is already connected to a different Firebase account. Sign in to that account; accounts cannot be merged automatically.",
              { cause: linkError },
            );
          }
          throw linkError;
        }
      }
    } catch (error) {
      console.error("Social authentication failed:", error);

      const message =
        error?.code === "auth/popup-closed-by-user"
          ? "Sign-in was cancelled. Please try again."
          : error?.message?.startsWith("Please choose the Google account") ||
              error?.message?.startsWith("This GitHub account")
            ? error.message
            : error?.response?.data?.message ||
              error?.message ||
              "Unable to sign in. Please try again.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailVerificationComplete = async () => {
    // When email verification was started from account setup (for example,
    // a phone-authenticated user adding an email), finish onboarding here.
    if (accountSetupStep && pendingProfileDataRef.current) {
      if (isLoading) return;

      const pendingProfile = pendingProfileDataRef.current;
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        toast.error("Your verification session expired. Please sign in again.");
        return;
      }

      try {
        setIsLoading(true);
        await firebaseUser.reload();

        if (!firebaseUser.emailVerified) {
          toast.error(
            "Your email is not verified yet. Please check your inbox.",
          );
          return;
        }

        // Refresh the verified Firebase identity and establish/update the
        // server session before saving the profile.
        const token = await firebaseUser.getIdToken(true);
        const loginResponse = await api.post("/api/auth/login", { token });
        const authenticatedUser = loginResponse?.data?.user;

        if (!authenticatedUser) {
          throw new Error("Authenticated user information was not returned.");
        }

        const response = await api.patch("/api/auth/profile", {
          name: pendingProfile.name,
          email: firebaseUser.email?.trim().toLowerCase(),
          phoneNumber:
            pendingProfile.phoneNumber ||
            firebaseUser.phoneNumber ||
            accountSetupUser?.phoneNumber ||
            undefined,
        });

        const completedUser = response?.data?.user;
        if (!completedUser) {
          throw new Error("Updated user information was not returned.");
        }

        pendingProfileDataRef.current = null;
        setUser(completedUser);
        setAccountSetupUser(null);
        setAccountSetupStep(false);
        setEmailVerificationStep(false);
        reset();
        toast.success("Email verified. Your account is ready.");
        onClose();
      } catch (error) {
        console.error("Account setup after email verification failed:", error);
        setEmailVerificationStep(false);
        setAccountSetupUser((current) => ({
          ...(current || {}),
          email: firebaseUser.email || pendingProfile.email,
          emailVerified: firebaseUser.emailVerified === true,
          phoneNumber:
            firebaseUser.phoneNumber ||
            current?.phoneNumber ||
            pendingProfile.phoneNumber ||
            "",
          phoneVerified: Boolean(
            firebaseUser.phoneNumber || current?.phoneVerified,
          ),
        }));
        toast.error(
          error?.response?.data?.message ||
            "Email verified, but account setup could not finish. Please press Continue again.",
        );
      } finally {
        setIsLoading(false);
      }

      return;
    }

    // Standard email-signup flow continues to password creation.
    setEmailVerificationStep(false);
    setPasswordCreationStep(true);
    setShowPassword(false);
    setShowConfirmPassword(false);

    reset({
      newPassword: "",
      confirmPassword: "",
    });

    toast.success("Email verified. Now create your password.");
  };

  const handlePasswordCreation = async (data) => {
    if (isLoading) return;

    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      const user = auth.currentUser;

      if (!user) {
        toast.error("Your signup session has expired. Please sign up again.");
        return;
      }

      await updatePassword(user, data.newPassword);

      const token = await user.getIdToken(true);

      const response = await api.post("/api/auth/login", {
        token,
      });

      const createdUser = response?.data?.user;

      toast.success("Account created. Let’s complete your profile.");

      setUser(createdUser);
      setAccountSetupUser({
        ...createdUser,
        email: user.email || createdUser?.email || "",
        emailVerified: user.emailVerified === true,
        phoneNumber: user.phoneNumber || createdUser?.phoneNumber || "",
        phoneVerified: Boolean(user.phoneNumber),
      });
      setAccountSetupStep(true);
    } catch (error) {
      console.error("Password creation failed:", error);

      if (error?.code === "auth/requires-recent-login") {
        toast.error(
          "Your signup session expired. Please start the signup process again.",
        );
      } else if (error?.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters.");
      } else {
        toast.error("Unable to create your password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (isLoading) return;

    const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");

    if (cleanPhoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    const formattedPhoneNumber = `+91${cleanPhoneNumber}`;

    try {
      setIsLoading(true);

      setOtp("");
      setConfirmationResult(null);

      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }

      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        },
      );

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        recaptchaVerifierRef.current,
      );

      setConfirmationResult(confirmation);
      setOtpStep(true);

      toast.success("Verification code sent.");
    } catch (error) {
      console.error("Phone OTP send failed:", error);

      const errorMessages = {
        "auth/invalid-phone-number": "Please enter a valid mobile number.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/quota-exceeded": "SMS quota exceeded. Please try again later.",
        "auth/network-request-failed":
          "Network error. Please check your connection.",
      };

      toast.error(
        errorMessages[error?.code] ||
          "Unable to send verification code. Please try again.",
      );

      clearRecaptchaVerifier();

      setConfirmationResult(null);
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (isLoading) return;

    if (!confirmationResult) {
      toast.error("Please request a verification code first.");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setIsLoading(true);

      // Verify the OTP with Firebase.
      const result = await confirmationResult.confirm(otp);
      clearRecaptchaVerifier();

      // Get a fresh Firebase ID token after successful verification.
      const token = await result.user.getIdToken(true);

      // Send the Firebase token to our backend so it can
      // create the MongoDB user and Redis session.
      const response = await api.post("/api/auth/login", {
        token,
      });

      const authenticatedUser = response?.data?.user;
      if (!authenticatedUser)
        throw new Error("User information was not returned.");

      if (authenticatedUser.profileCompleted) {
        toast.success("Login successful.");
        setUser(authenticatedUser);
        onClose();
        return;
      }

      toast.success("Phone verified. Let’s complete your profile.");
      setUser(authenticatedUser);
      setAccountSetupUser({
        ...authenticatedUser,
        phoneNumber:
          result.user.phoneNumber || authenticatedUser.phoneNumber || "",
        phoneVerified: Boolean(result.user.phoneNumber),
        email: result.user.email || authenticatedUser.email || "",
        emailVerified: result.user.emailVerified === true,
      });
      setAccountSetupStep(true);
    } catch (error) {
      console.error("Phone OTP verification failed:", error);

      const errorMessages = {
        "auth/invalid-verification-code": "The verification code is incorrect.",
        "auth/code-expired":
          "The verification code has expired. Please request a new code.",
        "auth/session-expired":
          "The verification session has expired. Please request a new code.",
      };

      toast.error(
        errorMessages[error?.code] ||
          error?.response?.data?.message ||
          "Unable to verify the code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (isLoading) return;

    setForgotPasswordError("");

    const email = normalizeEmail(getValues("email"));

    if (!email) {
      setForgotPasswordError("Email is required.");
      return;
    }

    if (!email.includes("@") || !email.split("@")[1]) {
      setForgotPasswordError("Please enter a valid email address.");
      return;
    }

    try {
      setIsLoading(true);

      await sendPasswordResetEmail(auth, email);

      setResetEmail(email);
      setPasswordResetSent(true);

      toast.success("Password reset email sent.");
    } catch (error) {
      console.error("Password reset failed:", error);

      const errorMessages = {
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/user-not-found": "No account exists with this email.",
        "auth/too-many-requests": "Too many requests. Please try again later.",
        "auth/network-request-failed":
          "Network error. Please check your connection.",
      };

      const message =
        errorMessages[error?.code] ||
        "Unable to send password reset email. Please try again.";

      setForgotPasswordError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromPasswordReset = () => {
    if (isLoading) return;

    setPasswordResetStep(false);
    setPasswordResetSent(false);
    setResetEmail("");
    setForgotPasswordError("");
  };

  const handleExistingAccount = (email) => {
    clearPhoneOtpSession();

    setAuthMode("login");
    setMethod("email");

    setEmailVerificationStep(false);
    setPasswordCreationStep(false);

    setPasswordResetStep(false);
    setPasswordResetSent(false);

    setVerificationEmail("");
    setResetEmail("");
    setForgotPasswordError("");

    setShowPassword(false);
    setShowConfirmPassword(false);

    setPhoneNumber("");

    reset({
      email,
      password: "",
    });

    toast.error(
      "An account already exists with this email. Please sign in instead.",
    );
  };

  const onSubmit = async (data) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const email = normalizeEmail(data.email);

      // Email signup.
      if (authMode === "register") {
        const displayName = data.name?.trim();

        if (!displayName) {
          toast.error("Name is required.");
          return;
        }

        const generatedPassword = `${crypto.randomUUID()}Aa1!`;

        const { user } = await createUserWithEmailAndPassword(
          auth,
          email,
          generatedPassword,
        );

        await updateProfile(user, {
          displayName,
        });

        await sendEmailVerification(user);

        setVerificationEmail(user.email);
        setEmailVerificationStep(true);

        reset();

        toast.success("Verification email sent.");

        return;
      }

      // Email login.
      if (authMode === "login") {
        const { user } = await signInWithEmailAndPassword(
          auth,
          email,
          data.password,
        );

        if (!user.emailVerified) {
          setVerificationEmail(user.email);
          setEmailVerificationStep(true);

          toast.error("Please verify your email before continuing.");

          return;
        }

        const token = await user.getIdToken();

        const response = await api.post("/api/auth/login", {
          token,
        });

        const authenticatedUser = response?.data?.user;

        toast.success("Login successful.");

        if (authenticatedUser?.profileCompleted) {
          setUser(authenticatedUser);
          onClose();
        } else {
          setUser(authenticatedUser);
          setAccountSetupUser({
            ...authenticatedUser,
            email: user.email || authenticatedUser?.email || "",
            emailVerified: user.emailVerified === true,
            phoneNumber:
              user.phoneNumber || authenticatedUser?.phoneNumber || "",
            phoneVerified: Boolean(user.phoneNumber),
          });
          setAccountSetupStep(true);
        }
      }
    } catch (error) {
      console.error("Email authentication failed:", error);

      if (error?.code === "auth/email-already-in-use") {
        handleExistingAccount(normalizeEmail(data.email));
        return;
      }

      const errorMessages = {
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/invalid-credential":
          "Invalid email or password. Please try again.",
        "auth/user-not-found": "No account exists with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/weak-password": "Password should be at least 6 characters.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/network-request-failed":
          "Network error. Please check your connection.",
      };

      toast.error(
        errorMessages[error?.code] ||
          "Authentication failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (isLoading) return;

    if (accountSetupStep) {
      pendingProfileDataRef.current = null;
      setEmailVerificationStep(false);
      setVerificationEmail("");
      toast("You can edit the email address and try again.");
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to reset signup session:", error);
    }

    clearPhoneOtpSession();

    setEmailVerificationStep(false);
    setPasswordCreationStep(false);

    setPasswordResetStep(false);
    setPasswordResetSent(false);

    setVerificationEmail("");
    setResetEmail("");
    setForgotPasswordError("");

    setAuthMode("register");
    setMethod("email");

    setPhoneNumber("");

    setShowPassword(false);
    setShowConfirmPassword(false);

    reset();
  };

  // const handleSelectPhone = () => {
  //   if (isLoading) return;

  //   clearPhoneOtpSession();
  //   setMethod("phone");
  // };

  // const handleSelectEmail = () => {
  //   if (isLoading) return;

  //   clearPhoneOtpSession();
  //   setMethod("email");
  // };

  const switchMode = async (nextMode) => {
    if (isLoading) return;

    if (auth.currentUser) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Failed to reset authentication state:", error);
      }
    }

    clearPhoneOtpSession();

    setAuthMode(nextMode);
    setMethod("email");

    setEmailVerificationStep(false);
    setPasswordCreationStep(false);

    setPasswordResetStep(false);
    setPasswordResetSent(false);

    setVerificationEmail("");
    setResetEmail("");
    setForgotPasswordError("");

    setShowPassword(false);
    setShowConfirmPassword(false);

    setPhoneNumber("");

    reset();
  };

  // const handleSendAccountPhoneCode = async () => {
  //   if (isLoading) return;
  //   const rawPhone = String(getValues("phoneNumber") || "").trim();
  //   const digits = rawPhone.replace(/\D/g, "");
  //   if (digits.length !== 10) {
  //     toast.error("Enter a valid 10-digit Indian mobile number first.");
  //     return;
  //   }
  //   const firebaseUser = auth.currentUser;
  //   if (!firebaseUser) {
  //     toast.error("Your sign-in session expired. Please sign in again.");
  //     return;
  //   }
  //   try {
  //     setIsLoading(true);
  //     clearRecaptchaVerifier();
  //     recaptchaVerifierRef.current = new RecaptchaVerifier(
  //       auth,
  //       "recaptcha-container",
  //       { size: "invisible" },
  //     );
  //     const confirmation = await linkWithPhoneNumber(
  //       firebaseUser,
  //       `+91${digits}`,
  //       recaptchaVerifierRef.current,
  //     );
  //     setPhoneLinkConfirmation(confirmation);
  //     setPhoneLinkSent(true);
  //     setPhoneLinkOtp("");
  //     toast.success("Verification code sent to your mobile.");
  //   } catch (error) {
  //     console.error("Account phone linking failed:", error);
  //     const messages = {
  //       "auth/credential-already-in-use":
  //         "This mobile number is linked to another account. Sign in to that account instead.",
  //       "auth/phone-number-already-exists":
  //         "This mobile number is already linked to another account.",
  //       "auth/invalid-phone-number": "Enter a valid mobile number.",
  //       "auth/requires-recent-login":
  //         "Please sign in again before linking a mobile number.",
  //     };
  //     toast.error(
  //       messages[error?.code] ||
  //         "Could not send the verification code. Please try again.",
  //     );
  //     clearRecaptchaVerifier();
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleVerifyAccountPhoneCode = async () => {
  //   if (isLoading) return;
  //   if (!phoneLinkConfirmation || phoneLinkOtp.trim().length !== 6) {
  //     toast.error("Enter the 6-digit verification code.");
  //     return;
  //   }
  //   try {
  //     setIsLoading(true);
  //     const result = await phoneLinkConfirmation.confirm(phoneLinkOtp.trim());
  //     clearRecaptchaVerifier();
  //     const linkedPhone = result.user.phoneNumber || "";
  //     const token = await result.user.getIdToken(true);
  //     const loginResponse = await api.post("/api/auth/login", { token });
  //     const refreshedUser = loginResponse?.data?.user;
  //     if (!refreshedUser)
  //       throw new Error(
  //         "Account details could not be refreshed after phone verification.",
  //       );
  //     setUser(refreshedUser);
  //     setValue("phoneNumber", linkedPhone, {
  //       shouldValidate: true,
  //       shouldDirty: true,
  //     });
  //     setAccountSetupUser((current) => ({
  //       ...(current || {}),
  //       ...refreshedUser,
  //       phoneNumber: linkedPhone,
  //       phoneVerified: true,
  //     }));
  //     setPhoneLinkConfirmation(null);
  //     setPhoneLinkSent(false);
  //     setPhoneLinkOtp("");
  //     toast.success("Mobile number verified and linked to this account.");
  //   } catch (error) {
  //     console.error("Account phone verification failed:", error);
  //     const messages = {
  //       "auth/invalid-verification-code": "The verification code is incorrect.",
  //       "auth/code-expired":
  //         "The verification code has expired. Request a new one.",
  //       "auth/credential-already-in-use":
  //         "This mobile number is linked to another account.",
  //     };
  //     toast.error(
  //       messages[error?.code] || "Could not verify this mobile number.",
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleCompleteProfile = async (data) => {
    if (isLoading) return;

    const name = data.name?.trim();
    const authenticatedEmail =
      auth.currentUser?.email?.trim().toLowerCase() ||
      accountSetupUser?.email?.trim().toLowerCase() ||
      "";

    if (!name || name.length < 2) {
      toast.error("Please enter your name (at least 2 characters).");
      return;
    }
    if (name.toLowerCase() === "user") {
      toast.error("Please enter your name, not User.");
      return;
    }
    if (!authenticatedEmail) {
      toast.error("Your signed-in account does not have an email address.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.patch("/api/auth/profile", { name });
      const user = response.data?.user;
      if (!user) throw new Error("Updated user information was not returned.");

      setUser(user);
      setAccountSetupUser(null);
      setAccountSetupStep(false);
      pendingProfileDataRef.current = null;
      reset();
      toast.success("Account setup completed.");
      onClose();
    } catch (error) {
      console.error("Account setup failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to complete account setup. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .auth-panel-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
          overscroll-behavior: contain;
        }

        .auth-panel-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-content-transition { transition: none !important; }
        }
      `}</style>

      <AuthModalFrame onClose={handleClose} isLoading={isLoading}>
        <div className="grid h-full min-h-0 w-full md:grid-cols-[0.9fr_1.1fr]">
          <AuthBrandPanel />

          {/* Auth panel */}
          <div className="auth-panel-scroll min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="flex min-h-full flex-col px-5 pb-6 pt-14 sm:px-8 sm:pb-8 sm:pt-10 md:px-9 lg:px-11">
              <div className="shrink-0 pr-12">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
                  {accountSetupStep
                    ? "Account setup"
                    : authMode === "login"
                      ? passwordResetStep
                        ? "Password recovery"
                        : "Sign in"
                      : passwordCreationStep
                        ? "Secure your account"
                        : "Create account"}
                </p>

                <h3 className="mt-1.5 text-[27px] leading-tight font-semibold tracking-[-0.035em] text-white sm:text-[30px]">
                  {accountSetupStep ? (
                    "Complete your account."
                  ) : passwordResetStep ? (
                    passwordResetSent ? (
                      "Check your email."
                    ) : (
                      "Reset your password."
                    )
                  ) : passwordCreationStep ? (
                    "Create your password."
                  ) : authMode === "login" ? (
                    <>
                      <span
                        style={{
                          fontFamily: "sans-serif",
                          fontSize: 24,
                          fontWeight: 400,
                        }}
                      >
                        Welcome to{" "}
                      </span>
                      <span
                        style={{
                          fontFamily: '"Zen Dots", sans-serif',
                        }}
                      >
                        RIO
                      </span>
                      .
                    </>
                  ) : (
                    "Create your account."
                  )}
                </h3>

                <p className="mt-1.5 text-[13px] leading-5 text-white/50 sm:text-sm sm:leading-6">
                  {accountSetupStep
                    ? "Add your name to finish setting up your account."
                    : passwordResetStep
                      ? passwordResetSent
                        ? "We sent a secure password reset link to your email address."
                        : "Enter your email and we’ll send you a secure reset link."
                      : passwordCreationStep
                        ? "Your email is verified. Choose a password to finish your account."
                        : authMode === "login"
                          ? "Continue building your career intelligence."
                          : "Start building your personalized career intelligence."}
                </p>
              </div>

              <AnimatePresence mode="sync" initial={false}>
                {accountSetupStep ? (
                  <motion.form
                    key="account-setup"
                    onSubmit={(event) =>
                      handleSubmit(handleCompleteProfile)(event)
                    }
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, y: 0 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className="mt-8 space-y-4"
                  >
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/70">
                        Full name
                      </label>
                      <input
                        {...register("name", {
                          required: "Name is required",
                        })}
                        defaultValue={accountSetupUser?.name || ""}
                        placeholder="Your name"
                        autoComplete="name"
                        className="h-10 w-full rounded-full md:rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/30"
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-xs text-red-400">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/70">
                        Verified email
                      </label>
                      <div className="flex min-h-12 items-center justify-between gap-3 rounded-full md:rounded-xl border border-white/10 bg-white/[0.045] px-4">
                        <span className="min-w-0 break-all text-sm text-white">
                          {auth.currentUser?.email ||
                            accountSetupUser?.email ||
                            "Email unavailable"}
                        </span>
                        {(auth.currentUser?.emailVerified ||
                          accountSetupUser?.emailVerified ||
                          auth.currentUser?.providerData?.some((provider) =>
                            ["google.com", "github.com"].includes(
                              provider.providerId,
                            ),
                          )) && (
                          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#A8D9B8]">
                            <FiCheck size={12} /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="pt-1 text-xs leading-5 text-white/35">
                      Your account email is provided by your sign-in method. Add
                      your name to finish setup. You can add an optional,
                      unverified contact number later in your profile.
                    </p>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-full md:rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_12px_35px_rgba(0,0,0,0.24)] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? "Saving..." : "Continue"}
                      {!isLoading && <FiArrowRight size={16} />}
                    </button>
                  </motion.form>
                ) : passwordResetStep ? (
                  <motion.div
                    key="password-reset"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, y: 0 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className="mt-8"
                  >
                    {passwordResetSent ? (
                      <>
                        <div className="flex items-center justify-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#17191C]">
                              <FiCheck size={20} />
                            </div>
                          </div>
                        </div>

                        <div className="mt-7 text-center">
                          <p className="text-sm font-medium text-white/80">
                            Reset email sent
                          </p>

                          <p className="mt-3 break-all text-sm font-medium text-white">
                            {resetEmail}
                          </p>

                          <p className="mx-auto mt-4 max-w-[390px] text-sm leading-6 text-white/40">
                            Open your inbox and follow the secure link to create
                            a new password for your RIO account.
                          </p>
                        </div>

                        <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                          <div className="flex gap-3">
                            <FiMail
                              className="mt-0.5 shrink-0 text-white/45"
                              size={16}
                            />

                            <p className="text-xs leading-5 text-white/35">
                              Didn&apos;t receive it? Check your spam or junk
                              folder, then try sending the reset email again.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setPasswordResetSent(false);
                            setForgotPasswordError("");
                          }}
                          disabled={isLoading}
                          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full md:rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_10px_30px_rgba(0,0,0,0.20)] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Send again
                        </button>

                        <button
                          type="button"
                          onClick={handleBackFromPasswordReset}
                          disabled={isLoading}
                          className="mt-4 flex w-full items-center justify-center gap-2 text-xs font-medium text-white/40 transition-colors hover:text-white disabled:opacity-40"
                        >
                          <FiArrowLeft size={14} />
                          Back to sign in
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleBackFromPasswordReset}
                          disabled={isLoading}
                          className="mb-8 flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white disabled:opacity-40"
                        >
                          <FiArrowLeft size={14} />
                          Back to sign in
                        </button>

                        <label className="mb-1.5 block text-xs font-semibold text-white/70">
                          Email
                        </label>

                        <input
                          type="email"
                          {...register("email")}
                          placeholder="you@example.com"
                          autoComplete="email"
                          className={`h-12 w-full rounded-full md:rounded-xl border ${
                            forgotPasswordError
                              ? "border-red-400/40"
                              : "border-white/10"
                          } bg-white/[0.045] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/30`}
                        />

                        {forgotPasswordError && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-xs text-red-400"
                          >
                            {forgotPasswordError}
                          </motion.p>
                        )}

                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={isLoading}
                          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full md:rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_12px_35px_rgba(0,0,0,0.24)] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isLoading
                            ? "Sending reset email..."
                            : "Send reset link"}

                          {!isLoading && <FiArrowRight size={16} />}
                        </button>
                      </>
                    )}
                  </motion.div>
                ) : emailVerificationStep ? (
                  <EmailVerification
                    email={verificationEmail}
                    onVerified={handleEmailVerificationComplete}
                    onChangeEmail={handleChangeEmail}
                  />
                ) : passwordCreationStep ? (
                  <motion.form
                    key="password-creation"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, y: 0 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    onSubmit={(event) =>
                      handleSubmit(handlePasswordCreation)(event)
                    }
                    className="mt-8 space-y-5"
                  >
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/70">
                        Create password
                      </label>

                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          {...register("newPassword", {
                            required: "Password is required",
                            minLength: {
                              value: 6,
                              message:
                                "Password should be at least 6 characters.",
                            },
                          })}
                          placeholder="Create your password"
                          autoComplete="new-password"
                          className="h-10 w-full rounded-full md:rounded-xl border border-white/10 bg-white/[0.045] px-4 pr-11 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/30"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((previous) => !previous)
                          }
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                        >
                          {showPassword ? (
                            <FiEyeOff size={17} />
                          ) : (
                            <FiEye size={17} />
                          )}
                        </button>
                      </div>

                      {errors.newPassword && (
                        <p className="mt-1.5 text-xs text-red-400">
                          {errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/70">
                        Confirm password
                      </label>

                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          {...register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (value) =>
                              value === newPassword ||
                              "Passwords do not match.",
                          })}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          className="h-10 w-full rounded-full md:rounded-xl border border-white/10 bg-white/[0.045] px-4 pr-11 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/30"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((previous) => !previous)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                        >
                          {showConfirmPassword ? (
                            <FiEyeOff size={17} />
                          ) : (
                            <FiEye size={17} />
                          )}
                        </button>
                      </div>

                      {errors.confirmPassword && (
                        <p className="mt-1.5 text-xs text-red-400">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full md:rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_12px_35px_rgba(0,0,0,0.24)] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? "Creating account..." : "Create account"}

                      {!isLoading && <FiArrowRight size={16} />}
                    </button>
                  </motion.form>
                ) : otpStep ? (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, y: 0 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className="mt-8"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (isLoading) return;

                        clearPhoneOtpSession();
                      }}
                      disabled={isLoading}
                      className="mb-8 flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white disabled:opacity-40"
                    >
                      <FiArrowLeft size={14} />
                      Back
                    </button>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
                      Verification
                    </p>

                    <h4 className="mt-2 text-2xl font-semibold text-white">
                      Verify your number
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-white/40">
                      Enter the verification code sent to your phone.
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(event) =>
                        setOtp(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="Enter 6-digit code"
                      autoComplete="one-time-code"
                      className="mt-7 h-12 w-full rounded-full md:rounded-xl border border-white/10 bg-white/[0.045] px-4 text-center text-lg tracking-[0.25em] text-white outline-none transition-colors placeholder:text-sm placeholder:tracking-normal placeholder:text-white/20 focus:border-white/30"
                    />

                    <button
                      type="button"
                      onClick={handleSendPhoneOtp}
                      disabled={isLoading}
                      className="mt-4 text-xs font-medium text-white/75 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Resend code
                    </button>

                    <button
                      type="button"
                      onClick={handleVerifyPhoneOtp}
                      disabled={isLoading || otp.length !== 6}
                      className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full md:rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_10px_30px_rgba(0,0,0,0.20)] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? "Verifying..." : "Verify & Continue"}

                      {!isLoading && <FiArrowRight size={16} />}
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div
                      aria-hidden={method !== "phone"}
                      className={`${
                        method === "phone"
                          ? "flex min-h-0 flex-1 flex-col mt-8 sm:mt-6"
                          : "hidden"
                      }`}
                    >
                      <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-300/[0.06]">
                            <FiPhone className="text-amber-200/80" size={16} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white/85">
                              Mobile OTP temporarily unavailable
                            </p>

                            <p className="mt-1 text-xs leading-5 text-white/45">
                              This service is currently unavailable. Please log
                              in using one of the other available methods below.
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                        Phone
                      </p>

                      <h4 className="mt-1.5 text-[22px] font-semibold leading-tight text-white sm:text-2xl">
                        Continue with phone
                      </h4>

                      <p className="mt-2 text-[13px] leading-5 text-white/50 sm:text-sm sm:leading-6">
                        We&apos;ll send a verification code to your mobile
                        number.
                      </p>

                      <div className="mt-4 sm:mt-5 flex flex-1 flex-col">
                        <div className="flex h-10 sm:h-11 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/[0.045]">
                          <span className="flex items-center border-r border-white/10 px-4 text-sm text-white/35">
                            +91
                          </span>

                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={phoneNumber}
                            onChange={(event) =>
                              setPhoneNumber(
                                event.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 10),
                              )
                            }
                            disabled
                            placeholder="Mobile number"
                            className="min-w-0 flex-1 cursor-not-allowed bg-transparent px-4 text-sm text-white/35 outline-none placeholder:text-white/25"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleSendPhoneOtp}
                          disabled={
                            isLoading ||
                            phoneNumber.replace(/\D/g, "").length !== 10
                          }
                          className="mt-auto sm:mt-3 flex h-10 sm:h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-white text-sm font-bold text-[#17191C] shadow-[0_8px_24px_rgba(0,0,0,0.20)] transition-[background-color,opacity,transform] duration-150 hover:bg-[#F5F5F5] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-white/[0.12] disabled:text-white/35 disabled:shadow-none"
                        >
                          {isLoading
                            ? "Sending code..."
                            : "Send verification code"}

                          {!isLoading && <FiArrowRight size={16} />}
                        </button>
                      </div>
                    </div>
                    <div
                      aria-hidden={method !== "email"}
                      className={method === "email" ? "mt-4 sm:mt-6" : "hidden"}
                    >
                      <form
                        onSubmit={(event) => handleSubmit(onSubmit)(event)}
                        className="mt-4 space-y-3 sm:mt-6 sm:space-y-4"
                      >
                        {authMode === "register" && (
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-white/70">
                              Full name
                            </label>

                            <input
                              {...register("name", {
                                required: "Name is required",
                              })}
                              placeholder="Your name"
                              autoComplete="name"
                              className="h-10 w-full rounded-full md:rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/30"
                            />

                            {errors.name && (
                              <p className="mt-1.5 text-xs text-red-400">
                                {errors.name.message}
                              </p>
                            )}
                          </div>
                        )}

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-white/70">
                            Email
                          </label>

                          <input
                            type="email"
                            {...register("email", {
                              required: "Email is required",
                            })}
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="h-10 w-full rounded-full md:rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/30"
                          />

                          {errors.email && (
                            <p className="mt-1.5 text-xs text-red-400">
                              {errors.email.message}
                            </p>
                          )}
                        </div>

                        {authMode === "login" && (
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-white/70">
                              Password
                            </label>

                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                {...register("password", {
                                  required: "Password is required",
                                })}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                className="h-10 w-full rounded-full md:rounded-xl border border-white/10 bg-white/[0.045] px-4 pr-11 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/30"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  setShowPassword((previous) => !previous)
                                }
                                aria-label={
                                  showPassword
                                    ? "Hide password"
                                    : "Show password"
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                              >
                                {showPassword ? (
                                  <FiEyeOff size={17} />
                                ) : (
                                  <FiEye size={17} />
                                )}
                              </button>
                            </div>

                            {errors.password && (
                              <p className="mt-1.5 text-xs text-red-400">
                                {errors.password.message}
                              </p>
                            )}
                          </div>
                        )}

                        {authMode === "login" && (
                          <button
                            type="button"
                            onClick={() => {
                              setForgotPasswordError("");
                              setPasswordResetStep(true);
                              setPasswordResetSent(false);
                            }}
                            disabled={isLoading}
                            className="text-xs text-white/35 transition-colors hover:text-white/75 disabled:opacity-40"
                          >
                            Forgot password?
                          </button>
                        )}

                        <button
                          type="submit"
                          className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-full md:rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-[background-color,opacity,transform] duration-150 hover:bg-[#F5F5F5] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-white/[0.12] disabled:text-white/35 disabled:shadow-none"
                          disabled={
                            isLoading ||
                            !String(emailValue).trim() ||
                            (authMode === "login"
                              ? !String(passwordValue)
                              : !String(nameValue).trim())
                          }
                        >
                          {isLoading ? "Please wait..." : "Continue with email"}

                          {!isLoading && <FiArrowRight size={16} />}
                        </button>
                      </form>

                      <div className="my-4 flex items-center gap-3 sm:my-5">
                        <div className="h-px flex-1 bg-white/10" />

                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                          or continue with
                        </span>

                        <div className="h-px flex-1 bg-white/10" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleSocialAuth(provider, "Google")}
                          disabled={isLoading}
                          className="flex h-10 items-center justify-center gap-2 rounded-full md:rounded-xl border border-white/10 bg-white/[0.035] text-xs font-semibold text-white/75 transition-colors hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-50"
                        >
                          <FcGoogle size={17} />
                          Google
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSocialAuth(githubProvider, "GitHub")
                          }
                          disabled={isLoading}
                          className="flex h-10 items-center justify-center gap-2 rounded-full md:rounded-xl border border-white/10 bg-white/[0.035] text-xs font-semibold text-white/75 transition-colors hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-50"
                        >
                          <FaGithub size={17} />
                          GitHub
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/40 sm:mt-5">
                        {authMode === "login"
                          ? "Don't have an account?"
                          : "Already have an account?"}

                        <button
                          type="button"
                          onClick={() =>
                            switchMode(
                              authMode === "login" ? "register" : "login",
                            )
                          }
                          className="font-semibold text-white transition-transform duration-200 hover:scale-[1.02]"
                        >
                          {authMode === "login" ? "Create one" : "Sign in"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </AuthModalFrame>
    </>
  );
};

export default Loginmodel;
