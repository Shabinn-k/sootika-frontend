import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import OTPVerification from "../components/Auth/OTPVerification";
import "./Registration.css";

const validationSchema = Yup.object({
  name: Yup.string().min(2, "Name must be at least 2 characters").max(50, "Name too long").matches(/^[a-zA-Z\s]+$/, "Only letters").required("Required"),
  number: Yup.string().matches(/^[0-9]{10}$/, "Must be 10 digits").required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Min 6 characters").matches(/(?=.*[a-z])(?=.*[A-Z])/, "Need uppercase & lowercase").required("Required"),
  cpass: Yup.string().oneOf([Yup.ref("password")], "Passwords must match").required("Required"),
  agree: Yup.boolean().oneOf([true], "Must agree to terms").required("Required"),
});

const Registration = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showOTP, setShowOTP] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const formik = useFormik({
    initialValues: { name: "", number: "", email: "", password: "", cpass: "", agree: false },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const res = await signup({ name: values.name, phone: values.number, email: values.email, password: values.password });
      setSubmitting(false);

      if (res?.success) {
        setRegisteredEmail(values.email);
        setShowOTP(true);
      }
    },
  });

  if (showOTP) {
    return <OTPVerification email={registeredEmail} onVerifySuccess={() => navigate("/")} onCancel={() => setShowOTP(false)} />;
  }

  return (
    <div className="register-page">
      <form onSubmit={formik.handleSubmit} className="register-card">
        <h2>Create Account</h2>
        <p className="subtitle">Join Sootika family</p>

        <div className="input-group">
          <input type="text" name="name" placeholder="Full Name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          {formik.touched.name && formik.errors.name && <small>{formik.errors.name}</small>}
        </div>

        <div className="input-group">
          <input type="tel" name="number" placeholder="Phone Number" value={formik.values.number} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          {formik.touched.number && formik.errors.number && <small>{formik.errors.number}</small>}
        </div>

        <div className="input-group">
          <input type="email" name="email" placeholder="Email Address" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          {formik.touched.email && formik.errors.email && <small>{formik.errors.email}</small>}
        </div>

        <div className="input-group">
          <input type="password" name="password" placeholder="Password" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          {formik.touched.password && formik.errors.password && <small>{formik.errors.password}</small>}
        </div>

        <div className="input-group">
          <input type="password" name="cpass" placeholder="Confirm Password" value={formik.values.cpass} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          {formik.touched.cpass && formik.errors.cpass && <small>{formik.errors.cpass}</small>}
        </div>

        <div className="terms-group">
          <input type="checkbox" name="agree" id="agree" checked={formik.values.agree} onChange={formik.handleChange} />
          <label htmlFor="agree">I agree to the <span>Terms of Use</span> & <span>Privacy Policy</span></label>
        </div>
        {formik.touched.agree && formik.errors.agree && <small className="error-text">{formik.errors.agree}</small>}

        <button type="submit" className="register-btn" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? "Creating..." : "Sign Up"}
        </button>

        <p className="login-link">Already have an account? <span onClick={() => navigate("/")}>Sign In</span></p>
      </form>
    </div>
  );
};

export default Registration;