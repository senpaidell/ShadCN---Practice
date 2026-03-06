import { AnimatePresence, motion } from "framer-motion";
import React, { useState, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Assets
import forgotBg from "@/assets/forgot-bg.jpg";
import loginBg from "@/assets/login-bg.jpg";
import logoImage from "@/assets/logo.jpg";
import signupBg from "@/assets/signup-bg.jpg";

type AuthMode =
  | "login"
  | "signup"
  | "forgot-email"
  | "forgot-verify"
  | "forgot-reset";

const CoshAuth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [otp, setOtp] = useState("")

  console.log(firstName,lastName,email,password)

  const navigate = useNavigate();
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error("Failed to save login information");
      } else {
        console.log("Successfully uploaded login information")
                
        //VERY IMPORTANT JWT Authentication and Redirection
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard")
      }
    } catch (error) {
        console.error("Error on Login Window", error)
    }

    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        console.error("Backend Error Details:", data); 
        throw new Error(data.message || data.error || "Failed to save signup information");
      } else {
        console.log("Successfully uploaded signup information")
      }
    } catch (error) {
        console.error("Error on Sign Up Window", error)
    }

    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  }


  return (
    <div style={styles.pageWrapper}>
      {/* Background for Card Modes */}
      {mode !== "signup" && (
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            ...styles.backgroundImage,
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(${
              mode === "login" ? loginBg : forgotBg
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
          {mode === "login" && (
            <div style={styles.cardContent}>
              <Logo />
              <form onSubmit={handleLogin} style={styles.formStack}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    placeholder="Enter Email"
                    style={styles.input}
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    placeholder="Enter Password"
                    style={styles.input}
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={styles.mainBtn}
                >
                  {isLoading ? "LOGGING IN..." : "LOG IN"}
                </button>
                <div style={styles.footerLinks}>
                  <span onClick={() => setMode("signup")} style={styles.link}>
                    SIGN UP
                  </span>
                  <span
                    onClick={() => setMode("forgot-email")}
                    style={styles.link}
                  >
                    FORGOT PASSWORD
                  </span>
                </div>
              </form>
            </div>
          )}

          {mode === "signup" && (
            <div style={styles.splitView}>
              {/* Left Side 35% */}
              <div style={styles.formSection}>
                <div style={{ maxWidth: "360px", width: "100%" }}>
                  <Logo />
                  <form onSubmit={handleSignUp}>
                    <div style={styles.formStack}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>First Name</label>
                      <input
                        style={styles.input}
                        placeholder="Enter First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}  
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Last Name</label>
                      <input
                        style={styles.input}
                        placeholder="Enter Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}  
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Email</label>
                        <input style={styles.input} placeholder="Enter Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Verification Code</label>
                      <div style={{ position: "relative" }}>
                        <input
                          style={styles.input}
                          placeholder="Enter Verification Code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}  
                        />
                        <span style={styles.inlineAction}>Send Code</span>
                      </div>
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Password</label>
                      <input
                        type="password"
                        style={styles.input}
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                      />
                    </div>
                    <button type="submit" style={styles.mainBtn}>SIGN UP</button>
                    <div style={{ textAlign: "center", marginTop: "15px" }}>
                      <span
                        onClick={() => setMode("login")}
                        style={styles.link}
                      >
                        LOG IN
                      </span>
                    </div>
                  </div>
                  </form>
                </div>
              </div>
              {/* Right Side 65% */}
              <div
                style={{
                  ...styles.promoSection,
                  backgroundImage: `url(${signupBg})`,
                }}
              />
            </div>
          )}

          {mode.startsWith("forgot") && (
            <div style={styles.cardContent}>
              <Logo />
              <ForgotFlow mode={mode} setMode={setMode} />
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

const ForgotFlow = ({ mode, setMode }: any) => (
  <div style={styles.formStack}>
    {mode === "forgot-email" && (
      <div style={styles.inputGroup}>
        <label style={styles.label}>Email</label>
        <input style={styles.input} placeholder="Enter Email" />
      </div>
    )}
    {mode === "forgot-verify" && (
      <div style={styles.inputGroup}>
        <label style={styles.label}>Verification</label>
        <input style={styles.input} placeholder="Enter Code" />
      </div>
    )}
    {mode === "forgot-reset" && (
      <>
        <div style={styles.inputGroup}>
          <label style={styles.label}>New Password</label>
          <input
            type="password"
            style={styles.input}
            placeholder="New Password"
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Confirm</label>
          <input type="password" style={styles.input} placeholder="Confirm" />
        </div>
      </>
    )}
    <button
      style={styles.mainBtn}
      onClick={() => {
        if (mode === "forgot-email") setMode("forgot-verify");
        else if (mode === "forgot-verify") setMode("forgot-reset");
        else setMode("login");
      }}
    >
      CONTINUE
    </button>
    <div style={styles.footerLinks}>
      <span onClick={() => setMode("login")} style={styles.link}>
        BACK TO LOGIN
      </span>
    </div>
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
    flex: 0.35,
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
    border: "none",
    backgroundColor: "#fff",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
    color: "black"
  },
  inlineAction: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "11px",
    fontWeight: "bold",
    color: "#000",
    cursor: "pointer",
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
