import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getUsers } from "../services/userService";
import { acceptRequest, getReceivedRequests, sendRequest, rejectRequest } from "../services/requestService";

function Requests() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const friends = users.filter((user) => user.status === "friend");
  const availableUsers = users.filter(
    (user) => user.status !== "received" && user.status !== "friend"
  );

  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.log("Error fetching users:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const data = await getReceivedRequests();
      setRequests(data);
    } catch (error) {
      console.log("Error fetching requests:", error);
    }
  };

  const handleSendRequest = async (receiverId) => {
    try {
      await sendRequest(receiverId);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          (user._id || user.id) === receiverId? { ...user, status: "sent" }: user));
    } catch (error) {
      console.log("Error sending request:", error);
    }
  };

  const handleReject = async (requestId, senderId) => {
    try {
      await rejectRequest(requestId);
      
      const senderUsername = requests.find((r) => (r._id || r.id) === requestId)?.sender?.username || "User";

      setRequests((prev) =>
        prev.filter((req) => (req._id || req.id) !== requestId)
      );

      setUsers((prev) => {
        const exists = prev.some((user) => (user._id || user.id) === senderId);
        if (exists) {
          return prev.map((user) =>
            (user._id || user.id) === senderId? { ...user, status: "send" }: user);
        }
        return [
          ...prev,
          {
            _id: senderId,
            username: senderUsername,
            status: "send"
          }
        ];
      });
    } catch (error) {
      console.log("Error rejecting request:", error);
    }
  };

  const handleAccept = async (requestId, senderId) => {
    try {
      await acceptRequest(requestId);

      const senderUsername = requests.find((r) => (r._id || r.id) === requestId)?.sender?.username || "User";

      setRequests((prev) =>
        prev.filter((req) => (req._id || req.id) !== requestId)
      );

      setUsers((prev) => {
        const exists = prev.some((user) => (user._id || user.id) === senderId);
        if (exists) {
          return prev.map((user) =>
            (user._id || user.id) === senderId ? { ...user, status: "friend" } : user
          );
        }

        return [
          ...prev,
          {
            _id: senderId,
            username: senderUsername,
            status: "friend"
          }
        ];
      });
    } catch (error) {
      console.log("Error accepting request:", error);
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
                <tr key={request._id || request.id}>
                  <td>{request.sender?.username}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleAccept(request._id || request.id, request.sender?._id)}
                    >
                      Accept
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleReject(request._id || request.id, request.sender?._id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dashboard-card mb-4">
          <h4 className="mb-4">Friends</h4>
          <table className="table table-dark table-borderless align-middle">
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {friends.map((friend) => (
                <tr key={friend._id || friend.id}>
                  <td>{friend.username}</td>
                </tr>
              ))}
              {friends.length === 0 && (
                <tr>
                  <td className="text-secondary">No friends yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
              {availableUsers.map((user) => (
                <tr key={user._id || user.id}>
                  <td>{user.username}</td>
                  <td>
                    {(!user.status || user.status === "send") && (
                      <button 
                        className="btn btn-info btn-sm"
                        onClick={() => handleSendRequest(user._id || user.id)}
                      >
                        Send Request
                      </button>
                    )}

                    {user.status === "sent" && (
                      <button className="btn btn-secondary btn-sm" disabled>
                        Request Sent
                      </button>
                    )}

                  </td>
                </tr>
              ))}
              {availableUsers.length === 0 && (
                <tr>
                  <td className="text-secondary" colSpan="2">No users available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Requests;
