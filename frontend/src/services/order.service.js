import api from "@/lib/axios";




export async function getOrders(params = {}) {
    const response = await api.get("/orders", {
    params: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 10,
      user_id: params.user_id ?? null,
      status: params.status ?? null,
      start_date: params.start_date ?? null,
      end_date: params.end_date ?? null,
    },
  });
    return response.data
    
}


export async function getOrderById(id) {
    const response = await api.get(`/orders/${id}`)
    
    return response.data
}



export async function updateOrder(data) {
    const response = await api.patch(`/orders/${data.order_id}`, {
        status: data.status ?? null,
        tracking_code: data.tracking_code ?? null,
        shipping_method: data.shipping_method ?? null
    })

    return response.data
    
}