import { createBrowserRouter, Navigate } from "react-router-dom";
import DoctorLayout from "../components/layout/DoctorLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import DoctorLoginPage from "../pages/auth/DoctorLoginPage";
import DoctorDashboardPage from "../pages/dashboard/DoctorDashboardPage";
import DoctorAppointmentsPage from "../pages/appointments/DoctorAppointmentsPage";
import DoctorAppointmentDetailsPage from "../pages/appointments/DoctorAppointmentDetailsPage";
import DoctorNotificationsPage from "../pages/notifications/DoctorNotificationsPage";
import DoctorReviewsPage from "../pages/reviews/DoctorReviewsPage";
import DoctorProfilePage from "../pages/profile/DoctorProfilePage";
import DoctorAppointmentVideoPage from "../pages/appointments/DoctorAppointmentVideoPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <DoctorLoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DoctorLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DoctorDashboardPage />,
      },
      {
        path: "appointments",
        element: <DoctorAppointmentsPage />,
      },
      {
        path: "appointments/:id",
        element: <DoctorAppointmentDetailsPage />,
      },
      {
        path: "appointments/:id/video",
        element: <DoctorAppointmentVideoPage />,
      },
      {
        path: "notifications",
        element: <DoctorNotificationsPage />,
      },
      {
        path: "reviews",
        element: <DoctorReviewsPage />,
      },
      {
        path: "profile",
        element: <DoctorProfilePage />,
      },
    ],
  },
]);