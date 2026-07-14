import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

/**
 * Layout wrapper for all authenticated / non-landing routes.
 * Renders the redesigned Navbar at the top and the matched
 * child route via <Outlet />.
 */
export default function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </>
  );
}
