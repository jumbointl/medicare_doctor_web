import api from "./client";

export async function getDoctorReviews(params = {}) {
  const { data } = await api.get("/api/v1/doctor-web/reviews", { params });
  return data;
}
