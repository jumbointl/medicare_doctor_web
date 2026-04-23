import api from "./client";

export async function getDoctorDashboard(clinicId = "") {
  try {
    const response = await api.get("/api/v1/doctor-web/dashboard", {
      params:
        clinicId && clinicId !== "all"
          ? { clinic_id: clinicId }
          : {},
    });

    return response.data;
  } catch (error) {
    console.error("getDoctorDashboard error =", error);
    throw error;
  }
}

export async function getDoctorCalendarStatus(clinicId = "") {
  try {
    const response = await api.get("/api/v1/doctor-web/calendar-status", {
      params:
        clinicId && clinicId !== "all"
          ? { clinic_id: clinicId }
          : {},
    });

    return response.data;
  } catch (error) {
    console.error("getDoctorCalendarStatus error =", error);
    throw error;
  }
}