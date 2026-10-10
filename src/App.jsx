import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { EventProvider } from "./context/EventContext";
import PwaBanner from "./components/PwaBanner";

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <AppRoutes />
        <PwaBanner />
      </EventProvider>
    </AuthProvider>
  );
}

export default App;