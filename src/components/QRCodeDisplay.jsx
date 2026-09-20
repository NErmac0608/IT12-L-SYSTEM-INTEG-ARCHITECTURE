import { QRCodeSVG } from "qrcode.react";

function QRCodeDisplay({ value, label = "Your event pass" }) {
  return <div className="qr-card"><QRCodeSVG value={value} size={190} bgColor="#ffffff" fgColor="#102a43" includeMargin /><p className="qr-label">{label}</p><code>{value}</code></div>;
}

export default QRCodeDisplay;
