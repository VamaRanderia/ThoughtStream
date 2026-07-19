import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getUsers, searchUsers } from "../services/userService";
import { acceptRequest, getReceivedRequests, sendRequest, rejectRequest, cancelRequest } from "../services/requestService";
import { useImageModal } from "../context/ImageModalContext";

function Requests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const { openImageModal } = useImageModal();

  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimeoutRef = useRef(null);

  // Pagination state for users list
  const [usersPage, setUsersPage] = useState(1);
  const [hasNextUsersPage, setHasNextUsersPage] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isFetchingNextUsers, setIsFetchingNextUsers] = useState(false);

  const availableUsers = users.filter(
    (user) => user.status !== "received" && user.status !== "friend"
  );

  useEffect(() => {
    fetchInitialUsers();
    fetchRequests();
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const fetchInitialUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await getUsers(1, 10);
      setUsers(data.users || []);
      setHasNextUsersPage(data.hasNextPage || false);
      setUsersPage(1);
    } catch (error) {
      console.log("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (!value.trim()) {
      fetchInitialUsers();
      return;
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      setIsLoadingUsers(true);
      try {
        const data = await searchUsers(value.trim(), 1, 10);
        setUsers(data.users || []);
        setUsersPage(1);
        setHasNextUsersPage(data.hasNextPage || false);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    }, 400);
  };

  const handleLoadMoreUsers = async () => {
    if (isFetchingNextUsers || !hasNextUsersPage) return;
    setIsFetchingNextUsers(true);
    try {
      let data;
      if (searchQuery.trim()) {
        data = await searchUsers(searchQuery.trim(), usersPage + 1, 10);
      } else {
        data = await getUsers(usersPage + 1, 10);
      }
      setUsers((prev) => [...prev, ...(data.users || [])]);
      setUsersPage((prevPage) => prevPage + 1);
      setHasNextUsersPage(data.hasNextPage || false);
    } catch (error) {
      console.log("Error loading more users:", error);
    } finally {
      setIsFetchingNextUsers(false);
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
      const data = await sendRequest(receiverId);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          (user._id || user.id) === receiverId ? { ...user, status: "sent", requestId: data._id || data.id } : user
        )
      );
    } catch (error) {
      console.log("Error sending request:", error);
    }
  };

  const handleCancelRequest = async (requestId, userId) => {
    try {
      await cancelRequest(requestId);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          (user._id || user.id) === userId ? { ...user, status: "send", requestId: undefined } : user
        )
      );
    } catch (error) {
      console.log("Error cancelling request:", error);
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
            (user._id || user.id) === senderId ? { ...user, status: "send" } : user
          );
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
                        <span 
                          className="fw-semibold text-hover-accent" 
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/profile/${sender._id || sender.id}`)}
                        >
                          {sender.username}
                        </span>
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
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
            <h4 className="mb-0">All Users</h4>
            
            {/* User Search Input */}
            <div style={{ width: "min(320px, 100%)" }}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
          
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
                        <span 
                          className="fw-semibold text-hover-accent" 
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/profile/${user._id || user.id}`)}
                        >
                          {user.username}
                        </span>
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
                        <button 
                          className="btn btn-secondary btn-sm request-sent-btn"
                          onClick={() => handleCancelRequest(user.requestId, user._id || user.id)}
                          onMouseEnter={(e) => {
                            e.target.innerText = "Cancel Request";
                            e.target.classList.remove("btn-secondary");
                            e.target.classList.add("btn-danger");
                          }}
                          onMouseLeave={(e) => {
                            e.target.innerText = "Request Sent";
                            e.target.classList.remove("btn-danger");
                            e.target.classList.add("btn-secondary");
                          }}
                        >
                          Request Sent
                        </button>
                      )}

                    </td>
                  </tr>
                );
              })}
              {availableUsers.length === 0 && !isLoadingUsers && (
                <tr>
                  <td className="text-secondary" colSpan="2">No users available.</td>
                </tr>
              )}
            </tbody>
          </table>

          {isLoadingUsers && (
            <div className="text-center py-3 text-secondary">
              <div className="spinner-border spinner-border-sm text-info me-2" role="status"></div>
              <span>Loading users...</span>
            </div>
          )}

          {hasNextUsersPage && (
            <div className="text-center mt-3">
              <button 
                className="btn btn-outline-info btn-sm" 
                onClick={handleLoadMoreUsers}
                disabled={isFetchingNextUsers}
              >
                {isFetchingNextUsers ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Requests;
