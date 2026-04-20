import api from "./client";

export async function getDoctorNotifications(params = {}) {
  const { data } = await api.get("/api/v1/doctor-web/notifications", { params });
  return data;
}

export async function markDoctorNotificationSeen(id) {
  const { data } = await api.post(`/api/v1/doctor-web/notifications/${id}/seen`);
  return data;
}