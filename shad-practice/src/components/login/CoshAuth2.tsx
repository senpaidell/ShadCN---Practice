import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Imported sonner

// Assets
import forgotBg from "@/assets/forgot-bg.jpg";
import loginBg from "@/assets/login-bg.jpg";
import logoImage from "@/assets/logo.jpg";
import signupBg from "@/assets/signup-bg.jpg";

type AuthMode =
  | "login"
  | "signup"
  | "signup-verify"
  | "forgot-email"
  | "forgot-verify"
  | "forgot-reset";

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

// Extracted Regex so it can be used for both validation and the live green glow
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_LETTER = /[a-zA-Z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_SYMBOL = /[!@#$%^&*(),.?":{}|<>]/;

const CoshAuth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");

  // Validation & Error States
  const [errors, setErrors] = useState<FormErrors>({});
  const [loginError, setLoginError] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Responsive State for Tablet/Mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  const navigate = useNavigate();

  // Listen for Window Resize for Responsive Layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Handlers ---

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('https://coshts-backend.vercel.app/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(true);
        setLoginAttempts(prev => prev + 1);
        throw new Error(data.error || "Failed to login");
      } else {
        console.log("Successfully logged in");
        setLoginError(false);
        setLoginAttempts(0);

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error on Login Window", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateSignup = (): boolean => {
    const newErrors: FormErrors = {};

    const fName = firstName.trim();
    const lName = lastName.trim();

    if (fName.length < 2 || fName.length > 30) {
      newErrors.firstName = "First name must be between 2 and 30 characters.";
    }
    if (lName.length < 2 || lName.length > 30) {
      newErrors.lastName = "Last name must be between 2 and 30 characters.";
    }

    // Extended email limit to 100 characters
    if (!EMAIL_REGEX.test(email) || email.length > 100) {
      newErrors.email = "Please enter a valid email (max 100 characters).";
    }

    if (password.length < 8 || !HAS_LETTER.test(password) || !HAS_NUMBER.test(password) || !HAS_SYMBOL.test(password)) {
      newErrors.password = "Password must be at least 8 characters and include letters, numbers, and symbols.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setIsLoading(true);
    try {
      const res = await fetch('https://coshts-backend.vercel.app/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Email already in use" || data.message === "Email already in use") {
          setErrors(prev => ({ ...prev, email: "This email is already in use." }));
          return;
        }
        throw new Error(data.message || data.error || "Failed to save signup information");
      } else {
        setPassword("");
        setConfirmPassword("");
        setMode("signup-verify");
      }
    } catch (error) {
      console.error("Error on Sign Up Window", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('https://coshts-backend.vercel.app/api/users/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || data.error || "Failed to verify OTP");

      setMode("login");
      setEmail("");
      setOtp("");

      toast.success("Account successfully created! Please log in.");

    } catch (error) {
      console.error("Error on OTP Verification Window", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('https://coshts-backend.vercel.app/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setMode("forgot-verify");
    } catch (error) {
      console.error("Error requesting password reset", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;

    setIsLoading(true);
    try {
      const res = await fetch('https://coshts-backend.vercel.app/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword: password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setMode("login");
      setPassword("");
      setConfirmPassword("");
      setOtp("");

      toast.success("Password successfully reset! Please log in.");

    } catch (error) {
      console.error("Error resetting password", error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setErrors({});
    setLoginError(false);
    setMode(newMode);
  }

  // --- Real-time Validation Checks for Green Glow (ONLY USED IN SIGNUP) ---
  const isFirstNameValid = firstName.trim().length >= 2 && firstName.trim().length <= 30;
  const isLastNameValid = lastName.trim().length >= 2 && lastName.trim().length <= 30;
  const isEmailValid = EMAIL_REGEX.test(email) && email.length <= 100;
  const isPasswordValid = password.length >= 8 && HAS_LETTER.test(password) && HAS_NUMBER.test(password) && HAS_SYMBOL.test(password);
  const isConfirmPasswordValid = confirmPassword.length > 0 && confirmPassword === password;

  return (
    <div style={styles.pageWrapper}>

      {/* BACKGROUND */}
      {mode !== "signup" && (
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            ...styles.backgroundImage,
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(${mode === "login" || mode === "signup-verify" ? loginBg : forgotBg
              })`,
          }}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === "signup" ? 40 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === "signup" ? -40 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={mode === "signup" ? styles.fullScreenWrapper : styles.authCard}
        >
          {/* LOGIN WINDOW */}
          {mode === "login" && (
            <div style={styles.cardContent}>
              <Logo />
              <form onSubmit={handleLogin} style={styles.formStack}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    placeholder="Enter Email"
                    maxLength={100} // Expanded limit
                    style={{
                      ...styles.input,
                      ...(loginError ? styles.inputError : {})
                    }}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value.trim());
                      setLoginError(false);
                    }}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    placeholder="Enter Password"
                    maxLength={30}
                    style={{
                      ...styles.input,
                      ...(loginError ? styles.inputError : {})
                    }}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLoginError(false);
                    }}
                    required
                  />
                </div>

                {loginError && (
                  <div style={{ textAlign: "center", marginTop: "4px" }}>
                    <span style={styles.errorText}>Wrong credentials.</span>
                    {loginAttempts >= 5 && (
                      <div style={{ marginTop: "6px" }}>
                        <span style={{ color: "#bbb", fontSize: "11px" }}>Too many failed attempts. </span>
                        <span
                          onClick={() => { switchMode("forgot-email"), setPassword("") }}
                          style={{ ...styles.link, color: "#ff4d4f", cursor: "pointer" }}
                        >
                          Reset your password?
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <button type="submit" disabled={isLoading} style={styles.mainBtn}>
                  {isLoading ? "LOGGING IN..." : "LOG IN"}
                </button>
                <div style={styles.footerLinks}>
                  <span onClick={() => { switchMode("signup"), setEmail(""), setPassword(""), setConfirmPassword(""), setFirstName(""), setLastName("") }} style={styles.link}>
                    SIGN UP
                  </span>
                  <span onClick={() => { switchMode("forgot-email"), setEmail(""), setPassword("") }} style={styles.link}>
                    FORGOT PASSWORD
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* SIGN UP WINDOW */}
          {mode === "signup" && (
            <div style={styles.splitView}>
              <div style={{ ...styles.formSection, flex: isMobile ? 1 : 0.35 }}>
                <div style={{ maxWidth: "360px", width: "100%" }}>
                  <Logo />
                  <form onSubmit={handleSignUp} noValidate>
                    <div style={styles.formStack}>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>First Name</label>
                        <input
                          maxLength={30}
                          style={{
                            ...styles.input,
                            ...(errors.firstName ? styles.inputError : (firstName && isFirstNameValid ? styles.inputSuccess : {}))
                          }}
                          placeholder="Enter First Name"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                          }}
                        />
                        {!errors.firstName && <span style={styles.helperText}>Must be between 2 and 30 characters.</span>}
                        {errors.firstName && <span style={styles.errorText}>{errors.firstName}</span>}
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Last Name</label>
                        <input
                          maxLength={30}
                          style={{
                            ...styles.input,
                            ...(errors.lastName ? styles.inputError : (lastName && isLastNameValid ? styles.inputSuccess : {}))
                          }}
                          placeholder="Enter Last Name"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                          }}
                        />
                        {!errors.lastName && <span style={styles.helperText}>Must be between 2 and 30 characters.</span>}
                        {errors.lastName && <span style={styles.errorText}>{errors.lastName}</span>}
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                          type="email"
                          maxLength={100} // Expanded limit
                          style={{
                            ...styles.input,
                            ...(errors.email ? styles.inputError : (email && isEmailValid ? styles.inputSuccess : {}))
                          }}
                          placeholder="Enter Email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value.trim());
                            if (errors.email) setErrors({ ...errors, email: undefined });
                          }}
                        />
                        {!errors.email && <span style={styles.helperText}>Valid email, max 100 characters.</span>}
                        {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                          type="password"
                          maxLength={30}
                          style={{
                            ...styles.input,
                            ...(errors.password ? styles.inputError : (password && isPasswordValid ? styles.inputSuccess : {}))
                          }}
                          placeholder="Enter Password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({ ...errors, password: undefined });
                          }}
                        />
                        {!errors.password && <span style={styles.helperText}>Min 8 characters, 1 letter, 1 number, 1 symbol.</span>}
                        {errors.password && <span style={styles.errorText}>{errors.password}</span>}
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Confirm Password</label>
                        <input
                          type="password"
                          maxLength={30}
                          style={{
                            ...styles.input,
                            ...(errors.confirmPassword ? styles.inputError : (confirmPassword && isConfirmPasswordValid ? styles.inputSuccess : {}))
                          }}
                          placeholder="Confirm Password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                          }}
                        />
                        {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}
                      </div>

                      <button type="submit" disabled={isLoading} style={styles.mainBtn}>
                        {isLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
                      </button>
                      <div style={{ textAlign: "center", marginTop: "15px" }}>
                        <span
                          onClick={() => { switchMode("login"), setEmail(""), setPassword(""), setConfirmPassword("") }}
                          style={styles.link}
                        >
                          LOG IN
                        </span>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {!isMobile && (
                <div
                  style={{
                    ...styles.promoSection,
                    backgroundImage: `url(${signupBg})`,
                  }}
                />
              )}
            </div>
          )}

          {/* SIGN UP - VERIFY OTP */}
          {mode === "signup-verify" && (
            <div style={styles.cardContent}>
              <Logo />
              <form onSubmit={handleVerifyOtp} style={styles.formStack}>
                <div style={{ textAlign: "center", color: "#bbb", fontSize: "12px", marginBottom: "10px" }}>
                  A verification code has been sent to<br />
                  <strong style={{ color: "white" }}>{email}</strong>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Verification Code</label>
                  <input
                    style={styles.input}
                    placeholder="Enter Verification Code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={isLoading} style={styles.mainBtn}>
                  {isLoading ? "VERIFYING..." : "VERIFY CODE"}
                </button>
                <div style={styles.footerLinks}>
                  <span onClick={() => switchMode("signup")} style={styles.link}>
                    BACK TO SIGN UP
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* FORGOT PASSWORD - EMAIL */}
          {mode === "forgot-email" && (
            <div style={styles.cardContent}>
              <Logo />
              <form onSubmit={handleForgotPassword} style={styles.formStack}>
                <div style={{ textAlign: "center", color: "#bbb", fontSize: "12px", marginBottom: "10px" }}>
                  Enter your email address and we'll send you a link to reset your password.
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    maxLength={100} // Expanded limit
                    style={styles.input}
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    required
                  />
                </div>
                <button type="submit" disabled={isLoading} style={styles.mainBtn}>
                  {isLoading ? "SENDING..." : "SEND OTP"}
                </button>
                <div style={styles.footerLinks}>
                  <span onClick={() => switchMode("login")} style={styles.link}>
                    BACK TO LOGIN
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* FORGOT PASSWORD - VERIFY OTP */}
          {mode === "forgot-verify" && (
            <div style={styles.cardContent}>
              <Logo />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (otp) switchMode("forgot-reset");
                }}
                style={styles.formStack}
              >
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Verification Code</label>
                  <input
                    style={styles.input}
                    placeholder="Enter Code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" style={styles.mainBtn}>
                  CONTINUE
                </button>
                <div style={styles.footerLinks}>
                  <span onClick={() => switchMode("login")} style={styles.link}>
                    BACK TO LOGIN
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* FORGOT PASSWORD - RESET */}
          {mode === "forgot-reset" && (
            <div style={styles.cardContent}>
              <Logo />
              <form onSubmit={handleResetPassword} style={styles.formStack}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>New Password</label>
                  <input
                    type="password"
                    maxLength={30}
                    style={styles.input}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <input
                    type="password"
                    maxLength={30}
                    style={{
                      ...styles.input,
                      ...(password !== confirmPassword && confirmPassword ? styles.inputError : {})
                    }}
                    placeholder="Confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {password !== confirmPassword && confirmPassword && (
                    <span style={styles.errorText}>Passwords do not match</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading || (password !== confirmPassword)}
                  style={styles.mainBtn}
                >
                  {isLoading ? "UPDATING..." : "UPDATE PASSWORD"}
                </button>
                <div style={styles.footerLinks}>
                  <span onClick={() => switchMode("login")} style={styles.link}>
                    BACK TO LOGIN
                  </span>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* Helpers */
const Logo = () => (
  <div style={styles.logoContainer}>
    <img src={logoImage} alt="COSH" style={styles.logoImg} />
  </div>
);

/* Styles */
const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    overflow: "hidden",
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: 0,
  },
  authCard: {
    zIndex: 1,
    backgroundColor: "#131313",
    padding: "40px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "420px",
    border: "1px solid #222",
  },
  cardContent: { display: "flex", flexDirection: "column", gap: "20px" },
  fullScreenWrapper: {
    zIndex: 1,
    width: "100vw",
    height: "100vh",
    display: "flex",
  },
  splitView: { display: "flex", width: "100%", height: "100%" },
  formSection: {
    backgroundColor: "#131313",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },
  promoSection: {
    flex: 0.65,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "relative",
  },
  logoContainer: { textAlign: "center", marginBottom: "25px" },
  logoImg: {
    width: "240px",
    height: "auto",
    display: "block",
    margin: "0 auto",
  },
  formStack: { display: "flex", flexDirection: "column", gap: "16px" },
  inputGroup: { display: "flex", flexDirection: "column" },
  label: {
    color: "white",
    fontSize: "12px",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "bold",
    fontFamily: "sans-serif",
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "2px solid transparent",
    backgroundColor: "#fff",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
    color: "black",
    outline: "none",
    transition: "all 0.3s ease",
  },
  inputError: {
    border: "2px solid #ff4d4f",
    backgroundColor: "#fff1f0",
    boxShadow: "0 0 8px rgba(255, 77, 79, 0.6)",
  },
  inputSuccess: {
    border: "2px solid #52c41a",
    boxShadow: "0 0 8px rgba(82, 196, 26, 0.6)",
  },
  helperText: {
    color: "#888",
    fontSize: "10px",
    marginTop: "4px",
    fontFamily: "sans-serif",
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: "11px",
    marginTop: "4px",
    fontFamily: "sans-serif",
  },
  mainBtn: {
    backgroundColor: "white",
    color: "black",
    border: "none",
    padding: "14px",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "8px",
    fontSize: "16px",
    fontFamily: "sans-serif",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
  },
  link: {
    color: "#bbb",
    fontSize: "10px",
    cursor: "pointer",
    textTransform: "uppercase",
    textDecoration: "underline",
    fontFamily: "sans-serif",
  },
};

export default CoshAuth;