import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, RequireRole } from "./lib/auth";
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
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/warga" element={<RequireRole role="warga"><Warga /></RequireRole>} />
        <Route path="/warga/scan" element={<RequireRole role="warga"><ScanQr /></RequireRole>} />
        <Route path="/ops" element={<RequireRole role="ops"><Ops /></RequireRole>} />
        <Route path="/ops/setoran" element={<RequireRole role="ops"><OpsSetoran /></RequireRole>} />
        <Route path="/ops/penukaran" element={<RequireRole role="ops"><OpsPenukaran /></RequireRole>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
