export default function CheckoutAddressSelector({
  addresses,
  value,
  onChange,
}) {
  return (
    <section>

      <h2>آدرس تحویل</h2>

      {addresses.map((address) => (
        <label
          key={address.id}
          style={{
            display: "block",
            marginBottom: "16px",
          }}
        >
          <input
            type="radio"
            checked={value === address.id}
            onChange={() =>
              onChange(address.id)
            }
          />

          <div>

            <div>
              {address.receiver_name}
            </div>

            <div>
              {address.receiver_mobile}
            </div>

            <div>
              {address.province}
              {" - "}
              {address.city}
            </div>

            <div>
              {address.full_address}
            </div>

          </div>

        </label>
      ))}

    </section>
  );
}