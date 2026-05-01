import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const Login = ({ setShowLogin }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agree) {
      toast.warn("Please agree to the terms of use & privacy policy");
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toast.success("Welcome back!");
      setShowLogin(false);

      if (res.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } else {
      setError(res.error || "Invalid email or password");
    }
  };

  return (
    <div className="login-popup" onClick={(e) => {
      if (e.target === e.currentTarget) setShowLogin(false);
    }}>
      <form onSubmit={handleSubmit} className="login-popup-container">
        <div className="login-poup-title">
          <h2>Sign In</h2>
          <h2 onClick={() => setShowLogin(false)} className="close-btn">
            ✕
          </h2>
        </div>

        <div className="login-popup-inputs">
          <input
            type="email"
            placeholder="Email Address"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="login-popup-condition">
          <input
            type="checkbox"
            id="agreeTerms"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <label htmlFor="agreeTerms">
            By continuing, I agree to the terms of use & privacy policy.
          </label>
        </div>

        <p>
          Create a new account?{" "}
          <span
            onClick={() => {
              setShowLogin(false);
              navigate("/registration");
            }}
          >
            Click here
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login; 