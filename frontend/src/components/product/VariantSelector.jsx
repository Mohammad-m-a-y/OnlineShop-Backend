"use client";

export default function VariantSelector({
  variants,
  selectedVariantId,
  onChange,
}) {
  if (!variants?.length) {
    return null;
  }

  return (
    <div>
      <h3>انتخاب مدل</h3>

      {variants.map((variant) => (
        <button
          key={variant.id}
          type="button"
          onClick={() => onChange(variant.id)}
          style={{
            margin: "5px",
            padding: "8px 12px",
            border:
              selectedVariantId === variant.id
                ? "2px solid blue"
                : "1px solid #ccc",
          }}
        >
          {variant.attributes
            .map(
              (attribute) =>
                `${attribute.name}: ${attribute.value}`
            )
            .join(" | ")}
        </button>
      ))}
    </div>
  );
}