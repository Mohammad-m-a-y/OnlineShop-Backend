import axios from "axios";




const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
})




api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);





api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if ( error.response?.status === 401 && !originalRequest._retry ){

      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {
            refresh_token: refreshToken,
          }
        );

        const { access_token, refresh_token } = response.data;

        localStorage.setItem( "access_token", access_token);

        localStorage.setItem( "refresh_token", refresh_token);

        originalRequest.headers.Authorization =`Bearer ${access_token}`;

        return api(originalRequest);
      } catch (refreshError) {

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);



export default api;