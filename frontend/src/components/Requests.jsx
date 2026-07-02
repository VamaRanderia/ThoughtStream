import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getUsers } from "../services/userService";

function Requests() {
  const requests = [
    
  ];

  // real backend users state
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.log("Error fetching users:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h2>Friend Requests</h2>
            <p className="text-secondary">
              Manage your connection requests.
            </p>
          </div>
        </div>

        {/* Friend Requests */}
        <div className="dashboard-card mb-4">
          <h4 className="mb-4">Received Requests</h4>
          <table className="table table-dark table-borderless align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th width="220">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.username}</td>
                  <td>
                    <button className="btn btn-success btn-sm me-2">Accept</button>
                    <button className="btn btn-danger btn-sm">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Users */}
        <div className="dashboard-card">
          <h4 className="mb-4">All Users</h4>
          <table className="table table-dark table-borderless align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th width="180">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((users) => (
                <tr key={users._id || users.id}>
                  <td>{users.username}</td>
                  <td>
                    {(!users.status || users.status === "send") && (
                      <button className="btn btn-info btn-sm">
                        Send Request
                      </button>
                    )}

                    {users.status === "sent" && (
                      <button className="btn btn-secondary btn-sm" disabled>
                        Request Sent
                      </button>
                    )}

                    {users.status === "friend" && (
                      <button className="btn btn-success btn-sm" disabled>
                        Friends
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Requests;