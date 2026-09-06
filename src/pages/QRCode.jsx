import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

function QRCode() {
  const navigate = useNavigate();

  const registration =
    JSON.parse(
      localStorage.getItem("lastRegistration")
    );

  if (!registration) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-xl border bg-white p-8 text-center">
          <h1 className="text-2xl font-bold">
            No Registration Found
          </h1>

          <button
            onClick={() => navigate("/events")}
            className="mt-6 rounded-lg bg-black px-5 py-3 font-semibold text-white"
          >
            Browse Events
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">

      <button
        onClick={() => navigate("/events")}
        className="mb-8 text-sm font-medium text-gray-600 hover:text-black"
      >
        ← Back to Events
      </button>

      <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">

        <h1 className="text-3xl font-bold">
          Your Event QR Code
        </h1>

        <p className="mt-3 text-gray-600">
          Present this QR code at the event venue for attendance verification.
        </p>

        <div className="mt-8 flex justify-center">

          <div className="rounded-xl border bg-white p-6">
            <QRCodeCanvas
              value={registration.qrToken}
              size={240}
              level="H"
            />
          </div>

        </div>

        <div className="mt-6 rounded-lg bg-gray-50 p-4">

          <p className="font-semibold">
            {registration.name}
          </p>

          <p className="mt-1 text-sm text-gray-600">
            {registration.studentId}
          </p>

          <p className="mt-1 text-sm text-gray-600">
            {registration.eventTitle}
          </p>

        </div>

        <p className="mt-5 break-all text-xs text-gray-400">
          Registration ID: {registration.qrToken}
        </p>

        <button
          onClick={() => navigate("/my-events")}
          className="mt-8 w-full rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
        >
          Go to My Events
        </button>

      </div>

    </main>
  );
}

export default QRCode;