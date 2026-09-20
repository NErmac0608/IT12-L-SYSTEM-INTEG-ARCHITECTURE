import { Link } from "react-router-dom";
import QRScanner from "../../components/QRScanner";

function ScannerWorkspace() { return <div><div className="page-heading"><div><p className="eyebrow">Organizer workspace</p><h1>Scan attendance</h1><p className="muted">The camera surface is ready for html5-qrcode integration.</p></div><Link className="button button-outline" to="/organizer/attendance">View attendance</Link></div><QRScanner /></div>; }
export default ScannerWorkspace;
