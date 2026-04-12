import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import LandingPage from "@/pages/LandingPage";
import RequestPage from "@/pages/RequestPage";
import ComparePage from "@/pages/ComparePage";
import ConfirmPage from "@/pages/ConfirmPage";
import ClinicProfilePage from "@/pages/ClinicProfilePage";
import ClinicsPage from "@/pages/ClinicsPage";
import MyPagesPage from "@/pages/MyPagesPage";
import ClinicPortalPage from "@/pages/ClinicPortalPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/confirm" element={<ConfirmPage />} />
        <Route path="/kliniker" element={<ClinicsPage />} />
        <Route path="/clinic/:id" element={<ClinicProfilePage />} />
        <Route path="/mina-sidor" element={<MyPagesPage />} />
        <Route path="/klinikportal" element={<ClinicPortalPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
