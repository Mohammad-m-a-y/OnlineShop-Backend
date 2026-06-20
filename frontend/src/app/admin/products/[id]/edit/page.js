import ProductEditPageClient from "@/components/admin/ProductEditPageClient";

export default async function EditProductPage({params,}) {

    const { id } = await params;

  return (
    <ProductEditPageClient
      productId={id}
    />
  );
}