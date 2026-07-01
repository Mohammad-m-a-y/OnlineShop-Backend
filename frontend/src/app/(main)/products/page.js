import { getProducts } from "@/services/product.service";
import { getBrands } from "@/services/brand.service";
import { getCategories } from "@/services/category.service";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import styles from "./ProductsPage.module.css";
import Pagination from "@/components/ui/Pagination/Pagination";


export const metadata = {
  title: "محصولات | فروشگاه آنلاین",
  description: "مشاهده و خرید محصولات فروشگاه آنلاین",
};

export default async function ProductsPage({ searchParams }) {

  const params = await searchParams;
  const currentPage = Number(params.page ?? 1);
  const brandsData = await getBrands({
    is_active: true,
  });

  const categoriesData = await getCategories({
    is_active: true,
  });



  const productData = await getProducts({
    brand_ids: params.brand_ids
      ? Array.isArray(params.brand_ids)
        ? params.brand_ids
        : [params.brand_ids]
      : undefined,

    search: params.search,
    min_price: params.min_price,
    max_price: params.max_price,
    category_ids: params.category_ids
      ? Array.isArray(params.category_ids)
        ? params.category_ids
        : [params.category_ids]
      : undefined,
    category_slugs: params.category_slugs
      ? Array.isArray(params.category_slugs)
        ? params.category_slugs
        : [params.category_slugs]
      : undefined,
    page_size: 20,
    page: currentPage
  });

  const products = productData.items ?? [];

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <ProductFilters
          brands={brandsData?.items}
          categories={categoriesData?.items}
        />
      </aside>

      <section className={styles.content}>
        <div className={styles.pageHeader}>
          <h1>محصولات</h1>

          <span>
            {productData?.total_count} محصول
          </span>
        </div>

        <div className={styles.grid}>
          {productData.items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={productData.total_pages}
          searchParams={params}
        />
      </section>
    </main>
  );
}