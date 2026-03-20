import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import LandingPage from "@/pages/LandingPage";
import RequestPage from "@/pages/RequestPage";
import ComparePage from "@/pages/ComparePage";
import ClinicPortalPage from "@/pages/ClinicPortalPage";
import AdminPage from "@/pages/AdminPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/clinic" element={<ClinicPortalPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
