import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AdminLayout() {
  return <><Navbar /><div className="app-shell"><Sidebar role="admin" /><main className="content"><Outlet /></main></div></>;
}

export default AdminLayout;
