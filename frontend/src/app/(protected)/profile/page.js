import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import styles from "./ProfilePage.module.css";


export default function ProfilePage() {
  return (
    <main className={styles.page}>
      <ProfileSidebar />

      <section className={styles.content}>
        <ProfileInfo />
      </section>
    </main>
  );
}