import api from "./client";

export async function getDoctorPatientFiles(patientId) {
  const { data } = await api.get(`/api/v1/doctor-web/patients/${patientId}/files`);
  return data;
}