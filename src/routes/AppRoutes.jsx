import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import StudentLayout from "../layouts/StudentLayout";
import OrganizerLayout from "../layouts/OrganizerLayout";
import AdminLayout from "../layouts/AdminLayout";
import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import StudentDashboard from "../pages/student/StudentDashboard";
import Events from "../pages/student/Events";
import EventDetails from "../pages/student/EventDetails";
import MyRegistrations from "../pages/student/MyRegistrations";
import MyQRCode from "../pages/student/MyQRCode";
import OrganizerWorkspace from "../pages/organizer/OrganizerWorkspace";
import EventManagementWorkspace from "../pages/organizer/EventManagementWorkspace";
import EventFormWorkspace from "../pages/organizer/EventFormWorkspace";
import ScannerWorkspace from "../pages/organizer/ScannerWorkspace";
import AttendanceWorkspace from "../pages/organizer/AttendanceWorkspace";
import AdminWorkspace from "../pages/admin/AdminWorkspace";
import AccountManagementWorkspace from "../pages/admin/AccountManagementWorkspace";

function PublicLayout() {
  return <><Navbar /><Outlet /></>;
}

function AppRoutes() {
  return <BrowserRouter><Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/events" element={<Events />} />
    </Route>
    <Route element={<ProtectedRoute allowedRoles={["student"]}><StudentLayout /></ProtectedRoute>}>
      <Route path="/dashboard/student" element={<StudentDashboard />} />
      <Route path="/student/events" element={<Events />} />
      <Route path="/student/events/:id" element={<EventDetails />} />
      <Route path="/student/registrations" element={<MyRegistrations />} />
      <Route path="/student/qr" element={<MyQRCode />} />
    </Route>
    <Route element={<ProtectedRoute allowedRoles={["organizer"]}><OrganizerLayout /></ProtectedRoute>}>
      <Route path="/dashboard/organizer" element={<OrganizerWorkspace />} />
      <Route path="/organizer/events" element={<EventManagementWorkspace />} />
      <Route path="/organizer/events/new" element={<EventFormWorkspace />} />
      <Route path="/organizer/events/:id/edit" element={<EventFormWorkspace />} />
      <Route path="/organizer/scanner" element={<ScannerWorkspace />} />
      <Route path="/organizer/attendance" element={<AttendanceWorkspace />} />
    </Route>
    <Route element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
      <Route path="/dashboard/admin" element={<AdminWorkspace />} />
      <Route path="/admin/accounts" element={<AccountManagementWorkspace />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}

export default AppRoutes;
