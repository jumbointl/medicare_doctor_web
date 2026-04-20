import api from "./client";

export async function loginDoctor(payload) {
  const { data } = await api.post("/api/v1/doctor-web/login", payload);
  return data;
}

export async function loginDoctorGoogle(payload) {
  const { data } = await api.post("/api/v1/doctor-web/login-google", payload);
  return data;
}

export async function getMe() {
  const { data } = await api.get("/api/v1/doctor-web/me");
  return data;
}

export async function logoutDoctor() {
  const { data } = await api.post("/api/v1/doctor-web/logout");
  return data;
}