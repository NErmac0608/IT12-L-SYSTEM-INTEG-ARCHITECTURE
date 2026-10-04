import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import MobileBottomNav from "../components/MobileBottomNav";

function OrganizerLayout() {
  return (
    <>
      <Navbar />
      <div className="app-shell pb-20 md:pb-0">
        <Sidebar role="organizer" />
        <main className="content">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav role="organizer" />
    </>
  );
}

export default OrganizerLayout;
