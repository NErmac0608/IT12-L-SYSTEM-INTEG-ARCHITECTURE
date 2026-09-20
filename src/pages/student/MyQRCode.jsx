import { QrCode } from "lucide-react";
import QRCodeDisplay from "../../components/QRCodeDisplay";
import { useAuth } from "../../context/AuthContext";

function MyQRCode() { const { user } = useAuth(); return <div><div className="page-heading"><div><p className="eyebrow">Student pass</p><h1>Your QR code</h1><p className="muted">This mock pass is ready for the future attendance scanner.</p></div><QrCode size={34} /></div><QRCodeDisplay value={`eventlink:student:${user.id}`} label={`${user.name} · Student pass`} /></div>; }

export default MyQRCode;
