import { Camera, ScanLine } from "lucide-react";

function QRScanner() {
	return <div className="scanner-frame"><ScanLine size={48} /><strong>Camera scanner placeholder</strong><p>Connect html5-qrcode here when the real attendance API is ready.</p><button className="button button-outline" type="button"><Camera size={16} /> Request camera</button></div>;
}

export default QRScanner;
