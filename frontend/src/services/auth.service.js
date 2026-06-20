import api from "@/lib/axios";



export async function login(username, password) {
  const response = await api.post("/auth/login-username", {
    username,
    password,
  });

  return response.data;
}


export async function logout() {
  const refreshToken = localStorage.getItem("refresh_token");

  await api.post("/auth/logout", {
    refresh_token: refreshToken,
  });

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}


// REGISTER
export async function register(data) {
  const response = await api.post("/auth/register", data);
  return response.data;
}

// SEND OTP
export async function sendOtp(mobile, purpose) {
  const response = await api.post("/auth/send-otp", {
    mobile:mobile,
    purpose:purpose,
  });

  return response.data;
}

// VERIFY OTP
export async function verifyOtp(mobile, otp_code, purpose ) {
  const response = await api.post("/auth/verify", {
    mobile:mobile,
    otp_code:otp_code,
    purpose:purpose,
  });

  localStorage.setItem("access_token", response.data.access_token);
  localStorage.setItem("refresh_token", response.data.refresh_token);
  return response.data;
}


 
// REFRESH TOKEN
// export async function refreshToken(refreshToken) {
//   const response = await authApi.post("/auth/refresh", {
//     refresh_token: refreshToken,
//   });

//   return response.data;
// }