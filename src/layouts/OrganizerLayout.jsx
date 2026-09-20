import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function OrganizerLayout() {
  return <><Navbar /><div className="app-shell"><Sidebar role="organizer" /><main className="content"><Outlet /></main></div></>;
}

export default OrganizerLayout;
