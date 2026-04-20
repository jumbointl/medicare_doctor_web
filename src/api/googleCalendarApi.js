import api from "./client";

export async function getDoctorGoogleCalendarConnectUrl() {
  const { data } = await api.get("/api/v1/doctor-web/google-calendar/connect-url");
  return data;
}

export async function getDoctorGoogleCalendarStatus() {
  const { data } = await api.get("/api/v1/doctor-web/google-calendar/status");
  return data;
}

export async function disconnectDoctorGoogleCalendar() {
  const { data } = await api.post("/api/v1/doctor-web/google-calendar/disconnect");
  return data;
}