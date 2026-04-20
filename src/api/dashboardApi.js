import api from "./client";

export async function getDoctorDashboard() {
  const { data } = await api.get("/api/v1/doctor-web/dashboard");
  return data;
}