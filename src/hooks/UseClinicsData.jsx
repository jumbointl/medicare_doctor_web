import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import admin from "../controllers/admin";

const getData = async () => {
  const res = await GET(admin.token, `get_clinic`);
  return res.data;
};

const UseClinicsData = () => {
  const {
    isLoading: clinicsLoading,
    data: clinicsData,
    error: clinicsError,
  } = useQuery({
    queryKey: ["clinics"],
    queryFn: getData,
  });

  return { clinicsData, clinicsLoading, clinicsError };
};

export default UseClinicsData;
