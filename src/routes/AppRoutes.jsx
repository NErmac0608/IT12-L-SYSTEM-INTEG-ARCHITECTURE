import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";

// Student
import Home from "../pages/Home";
import Events from "../pages/Events";
import EventDetails from "../pages/EventDetails";
import Register from "../pages/Register";
import RegistrationSuccess from "../pages/RegistrationSuccess";
import QRCode from "../pages/QRCode";
import MyEvents from "../pages/MyEvents";
import Login from "../pages/Login";

// Organizer
import OrganizerDashboard from "../pages/organizer/OrganizerDashboard";
import ManageEvents from "../pages/organizer/ManageEvents";
import CreateEvent from "../pages/organizer/CreateEvent";
import EditEvent from "../pages/organizer/EditEvent";
import RegisteredStudents from "../pages/organizer/RegisteredStudents";
import QRScanner from "../pages/organizer/QRScanner";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageOrganizers from "../pages/admin/ManageOrganizers";


function AppRoutes() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>
        {/* PUBLIC / STUDENT     */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/events"
          element={<Events />}
        />

        <Route
          path="/events/:id"
          element={<EventDetails />}
        />

        <Route
          path="/events/:id/register"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Register />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id/success"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <RegistrationSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id/qr"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <QRCode />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-events"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <MyEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ORGANIZER            */}

        <Route
          path="/organizer"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/events"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <ManageEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/events/create"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/events/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <EditEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/students"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <RegisteredStudents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/scanner"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <QRScanner />
            </ProtectedRoute>
          }
        />

        {/* ADMIN                */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/organizers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageOrganizers />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;