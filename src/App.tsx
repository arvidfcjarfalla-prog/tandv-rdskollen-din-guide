import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import LandingPage from "@/pages/LandingPage";
import RequestPage from "@/pages/RequestPage";
import ComparePage from "@/pages/ComparePage";
import ConfirmPage from "@/pages/ConfirmPage";
import ClinicProfilePage from "@/pages/ClinicProfilePage";
import ClinicsPage from "@/pages/ClinicsPage";
import MyPagesPage from "@/pages/MyPagesPage";
import ClinicPortalPage from "@/pages/ClinicPortalPage";
import AuthPage from "@/pages/AuthPage";
import ClinicAuthPage from "@/pages/ClinicAuthPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/confirm" element={<ConfirmPage />} />
        <Route path="/kliniker" element={<ClinicsPage />} />
        <Route path="/clinic/:id" element={<ClinicProfilePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/klinik/login" element={<ClinicAuthPage />} />
        <Route
          path="/mina-sidor"
          element={
            <ProtectedRoute>
              <MyPagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/klinikportal"
          element={
            <ProtectedRoute requireRole="clinic">
              <ClinicPortalPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      </Routes>
    </>
  );
}
