import { useState } from "react";
import { useFormik } from "formik";
import { Validation } from "../Authentication/Validation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import OTPVerification from "../components/Auth/OTPVerification";
import "./Registration.css";

const initialValues = {
  name: "",
  number: "",
  email: "",
  password: "",
  cpass: "",
  agree: false,
};

const Registration = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showOTP, setShowOTP] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const formik = useFormik({
    initialValues,
    validationSchema: Validation,
    onSubmit: async (values, { setSubmitting }) => {
      const res = await signup(values);
      setSubmitting(false);

      if (res && res.success) {
        setRegisteredEmail(res.email);
        setShowOTP(true);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleSubmit,
    handleChange,
    isSubmitting,
  } = formik;

  return (
    <div className="register-page">
      {showOTP && (
        <OTPVerification 
          email={registeredEmail} 
          onVerifySuccess={() => navigate("/")}
          onCancel={() => setShowOTP(false)}
        />
      )}
      <form onSubmit={handleSubmit} className="register-card">
        <h2>Create Account</h2>
        <p className="subtitle">Join Sootika family</p>

        {/* Name */}
        <div className="input-group">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="name"
          />
          {touched.name && errors.name && (
            <small>{errors.name}</small>
          )}
        </div>

        {/* Phone */}
        <div className="input-group">
          <input
            type="tel"
            name="number"
            placeholder="Phone Number"
            value={values.number}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="tel"
          />
          {touched.number && errors.number && (
            <small>{errors.number}</small>
          )}
        </div>

        {/* Email */}
        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="username"
          />
          {touched.email && errors.email && (
            <small>{errors.email}</small>
          )}
        </div>

        {/* Password */}
        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="new-password"
          />
          {touched.password && errors.password && (
            <small>{errors.password}</small>
          )}
        </div>

        {/* Confirm Password */}
        <div className="input-group">
          <input
            type="password"
            name="cpass"
            placeholder="Confirm Password"
            value={values.cpass}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="new-password"
          />
          {touched.cpass && errors.cpass && (
            <small>{errors.cpass}</small>
          )}
        </div>

        {/* Terms */}
        <div className="terms-group">
          <input
            type="checkbox"
            name="agree"
            id="agree"
            checked={values.agree}
            onChange={handleChange}
          />
          <label htmlFor="agree">
            I agree to the <span>Terms of Use</span> & <span>Privacy Policy</span>
          </label>
        </div>
        {touched.agree && errors.agree && (
          <small className="error-text">{errors.agree}</small>
        )}

        <button
          type="submit"
          className="register-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Sign Up"}
        </button>

        <p className="login-link">
          Already have an account? <span onClick={() => navigate("/")}>Sign In</span>
        </p>
      </form>
    </div>
  );
};

export default Registration;