import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { EventProvider } from "./context/EventContext";

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <AppRoutes />
      </EventProvider>
    </AuthProvider>
  );
}

export default App;