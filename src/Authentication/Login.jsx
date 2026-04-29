import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useAuth } from "./AuthContext";

const Login = ({ setShowLogin }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agree) return;

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success === true) {
      setShowLogin(false);
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={handleSubmit} className="login-popup-container">

        <div className="login-poup-title">
          <h2 className="font-extrabold text-4xl">Sign In</h2>
          <h2
            onClick={() => setShowLogin(false)}
            className="close-btn font-bold text-2xl"
          >
            X
          </h2>
        </div>

        <div className="login-popup-inputs">
          <input
            type="email"
            placeholder="E-mail"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="* * * * * * * *"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="login-popup-condition">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            required
          />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
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
