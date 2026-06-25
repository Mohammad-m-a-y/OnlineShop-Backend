"use client";
import styles from "./LoginForm.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as loginService, sendOtp } from "@/services/auth.service";
import Link from "next/link";
import OTPForm from "./OtpForm";
import { useAuth } from "@/context/AuthContext";




// step: "login" | "mobile" | "otp"
export default function LoginForm() {


  const router = useRouter();
  const [step, setStep] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);


  const { refreshUser } = useAuth();


  // login with username
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await loginService(username, password);

      await refreshUser(); 

      router.push("/");
    } catch (err) {
      setError("نام کاربری یا رمز عبور اشتباه است");
    } finally {
      setLoading(false);
    }
  };

  // send otp
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!mobile) return;
    try {
      setLoading(true);
      setError(null);
      await sendOtp(mobile, "login");
      setStep("otp");
    } catch (err) {
      setError("خطا در ارسال کد، شماره موبایل را بررسی کنید");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* برند */}
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🛍️</span>
          <span className={styles.brandName}>فروشگاه آنلاین</span>
        </div>

        {/* ─── step: login ─── */}
        {step === "login" && (
          <>
            <h1 className={styles.title}>خوش برگشتی!</h1>
            <p className={styles.subtitle}>برای ادامه وارد حساب کاربری خود شوید</p>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="username">نام کاربری</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    id="username"
                    className={styles.input}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="نام کاربری خود را وارد کنید"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label} htmlFor="password">رمز عبور</label>
                  <button
                    type="button"
                    className={styles.forgot}
                    onClick={() => { setError(null); setStep("mobile"); }}
                  >
                    فراموشی رمز / ورود با موبایل
                  </button>
                </div>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    id="password"
                    className={styles.input}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="رمز عبور خود را وارد کنید"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className={styles.error} role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <><span className={styles.spinner} />در حال ورود...</> : "ورود به حساب"}
              </button>
            </form>

            <p className={styles.register}>
              حساب کاربری ندارید؟{" "}
              <Link href="/register" className={styles.registerLink}>ثبت‌نام کنید</Link>
            </p>
          </>
        )}

        {/* ─── step: mobile ─── */}
        {step === "mobile" && (
          <>
            <h1 className={styles.title}>ورود با شماره موبایل</h1>
            <p className={styles.subtitle}>کد تأیید به شماره شما ارسال خواهد شد</p>

            <form className={styles.form} onSubmit={handleSendOtp} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="mobile">شماره موبایل</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                  <input
                    id="mobile"
                    className={styles.input}
                    type="tel"
                    inputMode="numeric"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className={styles.error} role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" className={styles.submitBtn} disabled={loading || !mobile}>
                {loading ? <><span className={styles.spinner} />در حال ارسال...</> : "ارسال کد تأیید"}
              </button>
            </form>

            <button
              className={styles.backBtn}
              onClick={() => { setError(null); setStep("login"); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              بازگشت به ورود با رمز عبور
            </button>
          </>
        )}

        {/* ─── step: otp ─── */}
        {step === "otp" && (
          <OTPForm
            mobile={mobile}
            purpose="login"
            onSuccess={()=> router.push("/")}
            onBack={() => { setError(null); setStep("mobile"); }}
          />
        )}

      </div>
    </div>
  );
}