import api from "./client";

export async function getDoctorAppointments(params = {}) {
  const { data } = await api.get("/api/v1/doctor-web/appointments", { params });
  return data;
}

export async function getDoctorAppointmentById(id) {
  const { data } = await api.get(`/api/v1/doctor-web/appointments/${id}`);
  return data;
}

export async function confirmDoctorAppointment(id) {
  const { data } = await api.post(`/api/v1/doctor-web/appointments/${id}/confirm`);
  return data;
}

export async function cancelDoctorAppointment(id) {
  const { data } = await api.post(`/api/v1/doctor-web/appointments/${id}/cancel`);
  return data;
}

export async function completeDoctorAppointment(id) {
  const { data } = await api.post(`/api/v1/doctor-web/appointments/${id}/complete`);
  return data;
}

export async function rescheduleDoctorAppointment(id, payload) {
  const { data } = await api.post(`/api/v1/doctor-web/appointments/${id}/reschedule`, payload);
  return data;
}

export async function getDoctorVideoJoinData(id) {
  const { data } = await api.post(`/api/v1/doctor-web/appointments/${id}/video/join-data`);
  return data;
}