export default function StarRating({ rating, size = 18,}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "2px",
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: size,
            color:
              star <= rating
                ? "#f59e0b"
                : "#d1d5db",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}