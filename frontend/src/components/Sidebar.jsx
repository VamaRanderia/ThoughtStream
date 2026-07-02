import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">

      <div className="sidebar-logo">
        ThoughtStream
      </div>

      <ul className="sidebar-menu">

        <li className="active">
          <Link to="/dashboard">
            <i className="bi bi-house-door-fill me-2"></i>
            Home
          </Link>
        </li>

        <li>
          <Link to="/requests">
            <i className="bi bi-person-plus-fill me-2"></i>
            Requests
          </Link>
        </li>

        <li>
          <Link to="/friends">
            <i className="bi bi-people-fill me-2"></i>
            Friends
          </Link>
        </li>

        <li>
          <Link to="/profile">
            <i className="bi bi-person-circle me-2"></i>
            Profile
          </Link>
        </li>

      </ul>

      <button className="btn btn-danger logout-btn">
        Logout
      </button>

    </div>
  );
}

export default Sidebar;