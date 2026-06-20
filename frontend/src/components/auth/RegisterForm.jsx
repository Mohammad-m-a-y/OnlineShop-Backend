"use client";
import { useState } from "react";
import styles from "./RegisterForm.module.css";
import OTPForm from "./OtpForm";
import { register } from "@/services/auth.service";
import Link from "next/link";




export default function RegisterForm() {

  const [step, setStep] = useState("register");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    full_name: "",
    mobile: "",
    password: "",
    email: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await register({ ...form, email: form.email || null });
      setMobile(form.mobile);
      setStep("otp");
    } catch (err) {
      setError("خطا در ثبت‌نام، لطفاً دوباره تلاش کنید");
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

        {step === "register" ? (
          <>
            <h1 className={styles.title}>ساخت حساب کاربری</h1>
            <p className={styles.subtitle}>اطلاعات خود را وارد کنید</p>

            <form onSubmit={handleRegister} className={styles.form} noValidate>

              {/* نام کاربری */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="username">نام کاربری</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input id="username" name="username" className={styles.input} placeholder="نام کاربری خود را وارد کنید" onChange={handleChange} required />
                </div>
              </div>

              {/* نام کامل */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="full_name">نام و نام خانوادگی</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M7 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <input id="full_name" name="full_name" className={styles.input} placeholder="نام کامل خود را وارد کنید" onChange={handleChange} required />
                </div>
              </div>

              {/* موبایل */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="mobile">شماره موبایل</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                  <input id="mobile" name="mobile" className={styles.input} placeholder="۰۹۱۲۳۴۵۶۷۸۹" onChange={handleChange} required inputMode="tel" />
                </div>
              </div>

              {/* رمز عبور */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">رمز عبور</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input id="password" name="password" type={showPassword ? "text" : "password"} className={styles.input} placeholder="رمز عبور خود را وارد کنید" onChange={handleChange} required />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}>
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

              {/* ایمیل */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  ایمیل <span className={styles.optional}>(اختیاری)</span>
                </label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input id="email" name="email" type="email" className={styles.input} placeholder="example@email.com" onChange={handleChange} />
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
                {loading ? <><span className={styles.spinner} />در حال ارسال...</> : "ثبت‌نام"}
              </button>
            </form>

            <p className={styles.loginHint}>
              حساب کاربری دارید؟{" "}
              <Link href="/login" className={styles.loginLink}>وارد شوید</Link>
            </p>
          </>
        ) : (
          <OTPForm
            mobile={mobile}
            purpose="register"
            onBack={() => setStep("login")} 
          />
        )}

      </div>
    </div>
  );
}