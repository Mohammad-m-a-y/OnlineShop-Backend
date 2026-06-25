import Link from "next/link";
import styles from "./create.module.css";
import SliderForm from "@/components/admin/sliders/SliderForm";


export default function CreateSliderPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Link href="/admin/sliders" className={styles.backBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          بازگشت به اسلایدرها
        </Link>
        <h1 className={styles.pageTitle}>ایجاد اسلایدر جدید</h1>
        <p className={styles.pageSubtitle}>تصویر و اطلاعات اسلایدر را وارد کنید</p>
      </div>

      <div className={styles.formCard}>
        <SliderForm mode="create" />
      </div>
    </div>
  );
}