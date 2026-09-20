import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function QRScanner() {
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [scanStatus, setScanStatus] = useState({ success: false, message: "" });

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
      },
      false
    );

    const handleSuccess = (decodedText) => {
      // 1. Send the ticket validation token straight to the PostgreSQL connector
      fetch("http://localhost:5000/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_token_string: decodedText }),
      })
        .then((res) => res.json())
        .then((data) => {
          setResult(decodedText);
          if (data.success) {
            setScanStatus({ success: true, message: "Student attendance has been recorded successfully!" });
          } else {
            setScanStatus({ success: false, message: data.message || "Invalid or unknown digital ticket token." });
          }
        })
        .catch((err) => {
          console.error("Database tracking error:", err);
          setResult(decodedText);
          setScanStatus({ success: false, message: "Communication error connecting to your backend server application." });
        });

      scanner.clear().catch(() => {});
    };

    const handleError = () => {};

    scanner.render(handleSuccess, handleError);

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">

        <button
          onClick={() => navigate("/organizer")}
          className="mb-6 text-sm font-semibold text-gray-600 hover:text-black"
        >
          ← Back to Dashboard
        </button>

        <div className="rounded-2xl border bg-white p-8 shadow-sm">

          <div className="text-center">
            <p className="text-sm font-semibold text-gray-500">
              ATTENDANCE
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              QR Code Scanner
            </h1>

            <p className="mt-2 text-gray-600">
              Scan a student's event QR code to verify attendance.
            </p>
          </div>

          {!result && (
            <div className="mx-auto mt-8 max-w-md">
              <div
                id="qr-reader"
                className="overflow-hidden rounded-xl border border-gray-200"
              />
            </div>
          )}

          {result && (
            <div className="mt-8 rounded-xl border p-6 text-center border-gray-200">

              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                scanStatus.success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              }`}>
                <span className="text-3xl font-bold">
                  {scanStatus.success ? "✓" : "✕"}
                </span>
              </div>

              <h2 className={`mt-5 text-2xl font-bold ${
                scanStatus.success ? "text-green-700" : "text-red-700"
              }`}>
                {scanStatus.success ? "Attendance Recorded" : "Verification Failed"}
              </h2>

              <p className="mt-2 text-gray-600">
                {scanStatus.message}
              </p>

              <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left">
                <p className="text-sm text-gray-500">
                  Scanned Token Value
                </p>

                <p className="mt-1 break-all font-mono text-sm font-semibold text-gray-700">
                  {result}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                <button
                  onClick={handleReset}
                  className="flex-1 rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 transition-colors"
                >
                  Scan Another
                </button>

                <button
                  onClick={() => navigate("/organizer/students")}
                  className="flex-1 rounded-lg border px-5 py-3 font-semibold hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  View Students
                </button>

              </div>

            </div>
          )}

        </div>

      </div>
    </main>
  );
}

export default QRScanner;
