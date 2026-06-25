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

  return response.data;
}


 