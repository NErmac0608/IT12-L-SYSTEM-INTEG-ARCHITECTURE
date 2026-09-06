import { useNavigate, useParams } from "react-router-dom";

function RegistrationSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">

      <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <span className="text-3xl">✓</span>
        </div>

        <h1 className="mt-6 text-3xl font-bold">
          Registration Successful
        </h1>

        <p className="mt-3 text-gray-600">
          You have successfully registered for this event.
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Your event QR code has been generated.
        </p>

        <button
          onClick={() => navigate(`/events/${id}/qr`)}
          className="mt-8 w-full rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
        >
          View QR Code
        </button>

        <button
          onClick={() => navigate("/events")}
          className="mt-3 w-full rounded-lg border px-5 py-3 font-semibold hover:bg-gray-50"
        >
          Browse More Events
        </button>

      </div>

    </main>
  );
}

export default RegistrationSuccess;