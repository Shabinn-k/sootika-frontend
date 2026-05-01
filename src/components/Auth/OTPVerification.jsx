import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../api/auth";
import "./OTPVerification.css";

const OTPVerification = ({ email, onVerifySuccess, onCancel }) => {
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
  if (timeLeft <= 0) {
    setCanResend(true);
    return;
  }

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [timeLeft]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    if (value && index < 4) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 5);
    if (/^\d+$/.test(pastedData)) {
      const pastedArray = pastedData.split("");
      const newOtp = [...otp];
      for (let i = 0; i < pastedArray.length && i < 5; i++) {
        newOtp[i] = pastedArray[i];
      }
      setOtp(newOtp);
      
      const lastIndex = Math.min(pastedArray.length, 4);
      if (inputRefs.current[lastIndex]) {
        inputRefs.current[lastIndex].focus();
      }
    }
  };

  const handleVerify = async (e) => {
    if (loading) return;
    e.preventDefault();
    const otpCode = otp.join("");
    
    if (otpCode.length < 5) {
      toast.error("Please enter complete 5-digit OTP");
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOTP({ email, otp: otpCode });
      toast.success("Account verified successfully! Please log in.");
      if (onVerifySuccess) {
        onVerifySuccess();
      } else {
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    try {
      await authService.resendOTP(email);
      toast.success("A new OTP has been sent to your email.");
      setTimeLeft(300);
      setCanResend(false);
      setOtp(["", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal">
        <button className="otp-close-btn" onClick={onCancel}>×</button>
        
        <div className="otp-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M3 7H21V17H3V7Z" stroke="#c9a47a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 10L11.5 13.5L17 10" stroke="#c9a47a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 7L12 3L21 7" stroke="#c9a47a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2>Verify Email</h2>
        <p>Enter 5-digit code sent to <strong>{email}</strong></p>
        
        <form onSubmit={handleVerify}>
          <div className="otp-input-group">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                className="otp-input"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                maxLength={1}
                disabled={loading}
              />
            ))}
          </div>

          <div className="otp-timer">
            {timeLeft > 0 ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#c9a47a" strokeWidth="1.5"/>
                  <polyline points="12 6 12 12 16 14" stroke="#c9a47a" strokeWidth="1.5" fill="none"/>
                </svg>
                <span>{formatTime(timeLeft)} remaining</span>
              </>
            ) : (
              <span className="expired">Code expired</span>
            )}
          </div>

          <button 
            type="submit" 
            className="verify-btn" 
            disabled={loading || otp.join("").length < 5}
          >
            {loading ? <span className="spinner"></span> : "Verify"}
          </button>
        </form>

        <button 
          type="button" 
          className={`resend-btn ${canResend ? "active" : ""}`} 
          onClick={handleResend}
          disabled={!canResend || loading}
        >
          Resend Code
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;