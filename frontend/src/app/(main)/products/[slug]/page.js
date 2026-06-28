import { getProductBySlug } from "@/services/product.service";
import ProductDetails from "@/components/product/ProductDetails";



export default async function ProductDetailPage({
  params,
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  return (
    <ProductDetails product={product} />
  );
}