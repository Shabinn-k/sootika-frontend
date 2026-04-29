import { useFormik } from "formik";
import { Validation } from "../Authentication/Validation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
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

  const formik = useFormik({
    initialValues,
    validationSchema: Validation,
    onSubmit: async (values, { setSubmitting }) => {
      const success = await signup(values);
      setSubmitting(false);

      if (success) {
        navigate("/");
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
      <form onSubmit={handleSubmit} className="register-card">
        <h2>Create Your Account</h2>
        <p className="subtitle">Join us and start shopping!</p>

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
        <div className="login-popup-condition">
          <input
            type="checkbox"
            name="agree"
            checked={values.agree}
            onChange={handleChange}
          />
          <p>
            By continuing, I agree to the terms of use & privacy policy.
          </p>
        </div>
        {touched.agree && errors.agree && (
          <small>{errors.agree}</small>
        )}

        <button
          type="submit"
          className="register-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default Registration;
