"use client";

import { useEffect, useState } from "react";
import { createAddress, updateAddress,} from "@/services/address.service";




export default function AddressFormModal({address, onClose, onSuccess}) {

  const isEdit = !!address;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] =
    useState({
      province: "",
      city: "",
      full_address: "",
      postal_code: "",
      receiver_name: "",
      receiver_mobile: "",
    });

  useEffect(() => {

    if (!address) return;

    setFormData({
      province: address.province || "",
      city: address.city || "",
      full_address:
        address.full_address || "",
      postal_code:
        address.postal_code || "",
      receiver_name:
        address.receiver_name || "",
      receiver_mobile:
        address.receiver_mobile || "",
    });

  }, [address]);

  function handleChange(e) {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {

    e.preventDefault();

    try {

      setLoading(true);

      if (isEdit) {

        await updateAddress(
          address.id,
          formData
        );

      } else {

        await createAddress(
          formData
        );

      }

      onSuccess();

    } catch (err) {

      console.error(err);

      alert(
        "خطا در ذخیره آدرس"
      );

    } finally {

      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">

      <div className="modal">

        <div className="modal-header">

          <h2>
            {isEdit
              ? "ویرایش آدرس"
              : "افزودن آدرس"}
          </h2>

          <button
            type="button"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
        >

          <div className="grid">

            <input
              name="receiver_name"
              placeholder="نام گیرنده"
              value={ formData.receiver_name }
              onChange={handleChange}
              required
            />

            <input
              name="receiver_mobile"
              placeholder="شماره موبایل"
              value={ formData.receiver_mobile }
              onChange={handleChange}
              required
            />

            <input
              name="province"
              placeholder="استان"
              value={formData.province}
              onChange={handleChange}
              required
            />

            <input
              name="city"
              placeholder="شهر"
              value={ formData.city }
              onChange={handleChange}
              required
            />

            <input
              name="postal_code"
              placeholder="کد پستی"
              value={formData.postal_code}
              onChange={handleChange}
              required
            />

          </div>

          <textarea
            name="full_address"
            placeholder="آدرس کامل"
            value={formData.full_address}
            onChange={handleChange}
            rows={4}
            required
          />

          <div className="actions">

            <button
              type="button"
              onClick={onClose}
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "در حال ذخیره..."
                : "ذخیره"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}