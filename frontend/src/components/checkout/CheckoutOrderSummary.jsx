import { formatPrice } from "@/utils/formatPrice";



export default function CheckoutOrderSummary({
  cart,
}) {
  const total = cart.items.reduce(
    (sum, item) =>
      sum +
      Number(
        item.variant.discounted_price
      ) *
      item.quantity,
    0
  );

  return (
    <section>

      <h2>خلاصه سفارش</h2>

      {cart.items.map((item) => {

        const image =
          item.product.images?.[0]
            ?.full_image_url;

        return (
          <div key={item.id}>

            <img
              src={
                image ||
                "/images/product-placeholder.png"
              }
              alt={item.product.name}
              width={80}
            />

            <div>

              <div>
                {item.product.name}
              </div>

              <div>
                تعداد:
                {" "}
                {item.quantity}
              </div>

              <div>
                {formatPrice(item.variant.discounted_price)}
                {" "}
                تومان
              </div>

            </div>

          </div>
        );
      })}

      <hr />

      <h3>
        جمع کل:
        {" "}
        {formatPrice(total)}
        {" "}
        تومان
      </h3>

    </section>
  );
}