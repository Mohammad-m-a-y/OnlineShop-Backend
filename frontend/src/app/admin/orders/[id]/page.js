import OrderDetailsPageClient
from "@/components/admin/orders/OrderDetailsPageClient";

export default async function Page({ params,}) {
  const { id } = await params;
  

  return (
    <OrderDetailsPageClient
      orderId={id}
    />
  );
}