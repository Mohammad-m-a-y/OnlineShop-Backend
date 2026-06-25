import OrderDetailesPage from "@/components/profile/order/OrderDetailesPage";



export default async function OrderDetailsPage({params}) {

  const { id } = await params;

 
  return (
    <OrderDetailesPage orderId={id} />
  );
}