import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function StudentLayout() {
  return <><Navbar /><div className="app-shell"><Sidebar role="student" /><main className="content"><Outlet /></main></div></>;
}

export default StudentLayout;
