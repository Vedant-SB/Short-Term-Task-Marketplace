import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Nav } from "../components/landing/Nav";
import { useAuth } from "../context/AuthContext";

/**
 * Layout wrapper for all authenticated / non-landing routes.
 * Renders the redesigned Navbar at the top and the matched
 * child route via Outlet.
 */
export default function AppLayout() {
  const { user } = useAuth();

  return (
    <>
      {user ? <Navbar /> : <Nav />}
      <Outlet />
    </>
  );
}