import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getUsers } from "../services/userService";

function Friends() {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const users = await getUsers();
        setFriends(users.filter((user) => user.status === "friend"));
      } catch (error) {
        console.log("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h2>Friends</h2>
            <p className="text-secondary">
              View your connections.
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          <h4 className="mb-4">Friends List</h4>
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
      </div>
    </div>
  );
}

export default Friends;
