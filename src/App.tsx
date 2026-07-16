import { Navigate, Route, Routes } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Warga from "./pages/Warga";
import Ops from "./pages/Ops";
import OpsSetoran from "./pages/OpsSetoran";
import OpsPenukaran from "./pages/OpsPenukaran";
import ScanQr from "./pages/ScanQr";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/warga" element={<Warga />} />
      <Route path="/warga/scan" element={<ScanQr />} />
      <Route path="/ops" element={<Ops />} />
      <Route path="/ops/setoran" element={<OpsSetoran />} />
      <Route path="/ops/penukaran" element={<OpsPenukaran />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
