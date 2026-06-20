"use client"


export default function AddToCartButton() {
  const handleClick = () => {
    console.log("add to cart");
  };

  return (
    <button onClick={handleClick}>
      افزودن به سبد خرید
    </button>
  );
}