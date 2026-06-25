export default function CheckoutNotes({
  value,
  onChange,
}) {
  return (
    <section>

      <h2>توضیحات سفارش</h2>

      <textarea
        rows={5}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

    </section>
  );
}