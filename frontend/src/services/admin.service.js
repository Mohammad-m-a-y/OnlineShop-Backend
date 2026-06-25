import api from "@/lib/axios";




export async function  getAdminDashboardStatus() {
    const response = await api.get('/admin/dashboard/sttus')
    
    return response.data
}