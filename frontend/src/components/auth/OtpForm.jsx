"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./OtpForm.module.css";
import { verifyOtp, sendOtp } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";




// purpose: "REGISTER" | "LOGIN" 
export default function OTPForm({ mobile, purpose, onBack }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(120); // ۲ دقیقه
  const [resendLoading, setResendLoading] = useState(false);
  const inputsRef = useRef([]);

  const { login } = useAuth();
  const router = useRouter();


  // resend timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);




  const handleChange = (value, index) => {  
    if (!/^\d*$/.test(value)) return;

    // پشتیبانی از paste کردن کد کامل
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d; });
      setOtp(newOtp);
      inputsRef.current[Math.min(index + digits.length, 5)]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("لطفاً کد ۶ رقمی را کامل وارد کنید");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const tokenData = await verifyOtp(mobile, code, purpose);

      await login(tokenData)
      
      router.push('/')

    } catch (err) {

      setError("کد وارد شده صحیح نیست یا منقضی شده");
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();

    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      setError(null);
      await sendOtp(mobile, purpose);
      setResendTimer(120);
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch {
      setError("خطا در ارسال مجدد کد");
    } finally {
      setResendLoading(false);
    }
  };

  const formatTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const titleMap = {
    register: "تایید شماره موبایل",
    login: "ورود با شماره موبایل"
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.iconWrap}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
      </div>

      <h2 className={styles.title}>{titleMap[purpose] ?? "کد تایید"}</h2>
      <p className={styles.subtitle}>
        کد ۶ رقمی ارسال شده به{" "}
        <span className={styles.mobile}>{mobile}</span>{" "}
        را وارد کنید
      </p>

      {/* باکس‌های OTP */}
      <div className={styles.otpRow}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            className={`${styles.otpInput} ${digit ? styles.filled : ""} ${error ? styles.hasError : ""}`}
            value={digit}
            maxLength={6}
            inputMode="numeric"
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            aria-label={`رقم ${i + 1}`}
          />
        ))}
      </div>

      {error && (
        <div className={styles.error} role="alert">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <button className={styles.submitBtn} onClick={handleVerify} disabled={loading || otp.join("").length !== 6}>
        {loading ? <><span className={styles.spinner} />در حال بررسی...</> : "تایید کد"}
      </button>

      {/* ارسال مجدد */}
      <div className={styles.resend}>
        {resendTimer > 0 ? (
          <span className={styles.timer}>
            ارسال مجدد تا <span className={styles.timerCount}>{formatTimer(resendTimer)}</span>
          </span>
        ) : (
          <button className={styles.resendBtn} onClick={handleResend} disabled={resendLoading}>
            {resendLoading ? "در حال ارسال..." : "ارسال مجدد کد"}
          </button>
        )}
      </div>

      {/* برگشت */}
      {onBack && (
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          بازگشت
        </button>
      )}
    </div>
  );
}