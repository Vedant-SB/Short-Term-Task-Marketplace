import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav>

      <Link to="/tasks">
        Tasks
      </Link>

      {!user && (
        <>
          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Register
          </Link>
        </>
      )}

      {user?.role === "individual" && (
        <>
          <Link to="/profile">
            Profile
          </Link>

          <Link to="/individual-dashboard">
            Dashboard
          </Link>

          <span>
            Individual
          </span>

          <button onClick={handleLogout}>
            Logout
          </button>
        </>
      )}

      {user?.role === "company" && (
        <>
          <Link to="/profile">
            Profile
          </Link>

          <Link to="/tasks/create">
            Create Task
          </Link>

          <Link to="/company-dashboard">
            Dashboard
          </Link>

          <span>
            Company
          </span>

          <button onClick={handleLogout}>
            Logout
          </button>
        </>
      )}

    </nav>
  );
}

export default Navbar;