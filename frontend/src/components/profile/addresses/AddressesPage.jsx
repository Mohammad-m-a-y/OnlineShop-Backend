"use client";

import { useEffect, useState } from "react";
import { getMyAddresses, deleteAddress } from "@/services/address.service";
import AddressFormModal from "./AddressFormModal";
import styles from "./AddressesPage.module.css";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  async function loadAddresses() {
    try {
      setLoading(true);
      const data = await getMyAddresses();
      setAddresses(data.items ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAddresses() }, []);

  async function handleDelete(id) {
    try {
      setDeletingId(id);
      await deleteAddress(id);
      await loadAddresses();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  function handleCreate() { setEditingAddress(null); setShowModal(true); }
  function handleEdit(address) { setEditingAddress(address); setShowModal(true); }

  return (
    <div className={styles.page}>

      {/* دیالوگ تأیید حذف */}
      {confirmId && (
        <div className={styles.overlay} onClick={() => setConfirmId(null)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogIcon}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </div>
            <h3 className={styles.dialogTitle}>حذف آدرس</h3>
            <p className={styles.dialogText}>آیا از حذف این آدرس مطمئن هستید؟</p>
            <div className={styles.dialogActions}>
              <button className={styles.cancelDialogBtn} onClick={() => setConfirmId(null)}>انصراف</button>
              <button className={styles.confirmDialogBtn} disabled={!!deletingId} onClick={() => handleDelete(confirmId)}>
                {deletingId ? <><span className={styles.spinnerSm} />حذف...</> : "بله، حذف کن"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* سرصفحه */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>آدرس‌های من</h1>
        <button className={styles.addBtn} onClick={handleCreate}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          افزودن آدرس
        </button>
      </div>

      {/* محتوا */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <span className={styles.spinner} />
          در حال بارگذاری...
        </div>
      ) : addresses.length === 0 ? (
        <div className={styles.empty}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <p>هنوز آدرسی ثبت نشده است</p>
          <button className={styles.emptyAddBtn} onClick={handleCreate}>افزودن اولین آدرس</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {addresses.map((address) => (
            <div key={address.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.receiverInfo}>
                  <span className={styles.receiverName}>{address.receiver_name}</span>
                  <span className={styles.receiverPhone}>{address.receiver_mobile}</span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.locationRow}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{address.province} — {address.city}</span>
                </div>
                <p className={styles.fullAddress}>{address.full_address}</p>
                <span className={styles.postalCode}>کد پستی: {address.postal_code}</span>
              </div>

              <div className={styles.cardFooter}>
                <button className={styles.editBtn} onClick={() => handleEdit(address)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  ویرایش
                </button>
                <button className={styles.deleteBtn} onClick={() => setConfirmId(address.id)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  </svg>
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddressFormModal
          address={editingAddress}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); loadAddresses(); }}
        />
      )}

    </div>
  );
}