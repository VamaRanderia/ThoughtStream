import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { getUsers } from "../services/userService";
import { acceptRequest, getReceivedRequests, sendRequest, rejectRequest } from "../services/requestService";
import { useImageModal } from "../context/ImageModalContext";

function Requests() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const { openImageModal } = useImageModal();

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
      
      const sender = requests.find((r) => (r._id || r.id) === requestId)?.sender || {};
      const senderUsername = sender.username || "User";
      const senderProfilePicture = sender.profilePicture;

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
            profilePicture: senderProfilePicture,
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

      const sender = requests.find((r) => (r._id || r.id) === requestId)?.sender || {};
      const senderUsername = sender.username || "User";
      const senderProfilePicture = sender.profilePicture;

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
            profilePicture: senderProfilePicture,
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
              {requests.map((request) => {
                const sender = request.sender || {};
                const avatarSrc = sender.profilePicture?.trim();
                const fallbackInitial = sender.username?.charAt(0)?.toUpperCase() || "U";
                return (
                  <tr key={request._id || request.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className={`avatar-circle ${avatarSrc ? "clickable" : ""}`}
                          onClick={() => avatarSrc && openImageModal(avatarSrc)}
                          title={avatarSrc ? "Click to view full image" : ""}
                        >
                          {avatarSrc ? (
                            <img src={avatarSrc} alt="" />
                          ) : (
                            <span>{fallbackInitial}</span>
                          )}
                        </div>
                        <span className="fw-semibold">{sender.username}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleAccept(request._id || request.id, sender._id || sender.id)}
                      >
                        Accept
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleReject(request._id || request.id, sender._id || sender.id)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })}
              {requests.length === 0 && (
                <tr>
                  <td className="text-secondary" colSpan="2">No pending friend requests.</td>
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
              {availableUsers.map((user) => {
                const avatarSrc = user.profilePicture?.trim();
                const fallbackInitial = user.username?.charAt(0)?.toUpperCase() || "U";
                return (
                  <tr key={user._id || user.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className={`avatar-circle ${avatarSrc ? "clickable" : ""}`}
                          onClick={() => avatarSrc && openImageModal(avatarSrc)}
                          title={avatarSrc ? "Click to view full image" : ""}
                        >
                          {avatarSrc ? (
                            <img src={avatarSrc} alt="" />
                          ) : (
                            <span>{fallbackInitial}</span>
                          )}
                        </div>
                        <span className="fw-semibold">{user.username}</span>
                      </div>
                    </td>
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
                );
              })}
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
