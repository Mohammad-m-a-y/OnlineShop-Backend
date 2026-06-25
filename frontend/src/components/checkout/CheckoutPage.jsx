"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";

import { getMyAddresses } from "@/services/address.service";
import { createOrder } from "@/services/order.service";

import CheckoutAddressSelector from "./CheckoutAddressSelector";
import CheckoutOrderSummary from "./CheckoutOrderSummary";
import CheckoutShippingMethod from "./CheckoutShippingMethod";
import CheckoutNotes from "./CheckoutNotes";
 


export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refreshCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [shippingMethod, setShippingMethod] = useState("post");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] =useState(false);


  
  useEffect(() => {
    async function loadAddresses() {
      try {
        const data = await getMyAddresses();

        setAddresses(data.items || []);
      } catch (err) {
        console.error(err);
      }
    }

    loadAddresses();
  }, []);

  async function handleSubmit() {
    if (!cart) return;

    if (!selectedAddress) {
      alert("آدرس را انتخاب کنید");
      return;
    }

    try {
      setSubmitting(true);

      const order = await createOrder({
        cart_id: cart.id,
        address_id: selectedAddress,
        shipping_method: shippingMethod,
        notes: notes,
      });

      await refreshCart();

      router.push(
        `/profile/orders/${order.id}`
      );
    } catch (err) {
      console.error(err);
      alert("ثبت سفارش ناموفق بود");
    } finally {
      setSubmitting(false);
    }
  }

  if (!cart) {
    return <div>سبد خرید خالی است</div>;
  }

  return (
    <div>

      <h1>تسویه حساب</h1>

      <CheckoutAddressSelector
        addresses={addresses}
        value={selectedAddress}
        onChange={setSelectedAddress}
      />

      <CheckoutShippingMethod
        value={shippingMethod}
        onChange={setShippingMethod}
      />

      <CheckoutNotes
        value={notes}
        onChange={setNotes}
      />

      <CheckoutOrderSummary cart={cart} />

      <button
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting
          ? "در حال ثبت..."
          : "ثبت سفارش"}
      </button>

    </div>
  );
}