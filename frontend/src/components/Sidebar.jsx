import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        ThoughtStream
      </div>

      <ul className="sidebar-menu">
        <li>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => isActive ? "active" : ""}
          >
            <i className="bi bi-house-door-fill me-2"></i>
            Home
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/requests" 
            className={({ isActive }) => isActive ? "active" : ""}
          >
            <i className="bi bi-person-plus-fill me-2"></i>
            Requests
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/friends" 
            className={({ isActive }) => isActive ? "active" : ""}
          >
            <i className="bi bi-people-fill me-2"></i>
            Friends
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/profile" 
            className={({ isActive }) => isActive ? "active" : ""}
          >
            <i className="bi bi-person-circle me-2"></i>
            Profile
          </NavLink>
        </li>
      </ul>

      <button className="btn btn-danger logout-btn" onClick={handleLogout}>
        <i className="bi bi-box-arrow-right me-2"></i>
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
