export default function CheckoutShippingMethod({
  value,
  onChange,
}) {
  return (
    <section>

      <h2>روش ارسال</h2>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >
        <option value="post">
          پست
        </option>

        <option value="tipax">
          تیپاکس
        </option>

        <option value="express">
          ارسال سریع
        </option>
      </select>

    </section>
  );
}