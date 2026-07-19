import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getFriends } from "../services/userService";
import { useImageModal } from "../context/ImageModalContext";

function Friends() {
  const [friends, setFriends] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const { openImageModal } = useImageModal();

  useEffect(() => {
    const fetchInitialFriends = async () => {
      setIsLoading(true);
      try {
        const data = await getFriends(1, 10);
        setFriends(data.friends || []);
        setHasNextPage(data.hasNextPage || false);
        setPage(1);
      } catch (error) {
        console.log("Error fetching friends:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialFriends();
  }, []);

  const handleLoadMore = async () => {
    if (isFetchingNextPage || !hasNextPage) return;
    setIsFetchingNextPage(true);
    try {
      const data = await getFriends(page + 1, 10);
      setFriends((prev) => [...prev, ...(data.friends || [])]);
      setPage((prevPage) => prevPage + 1);
      setHasNextPage(data.hasNextPage || false);
    } catch (error) {
      console.log("Error loading more friends:", error);
    } finally {
      setIsFetchingNextPage(false);
    }
  };

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
              {friends.map((friend) => {
                const avatarSrc = friend.profilePicture?.trim();
                const fallbackInitial = friend.username?.charAt(0)?.toUpperCase() || "U";
                return (
                  <tr key={friend._id || friend.id}>
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
                        <span className="fw-semibold">{friend.username}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {friends.length === 0 && !isLoading && (
                <tr>
                  <td className="text-secondary">No friends yet.</td>
                </tr>
              )}
            </tbody>
          </table>

          {isLoading && (
            <div className="text-center py-3 text-secondary">
              <div className="spinner-border spinner-border-sm text-info me-2" role="status"></div>
              <span>Loading friends...</span>
            </div>
          )}

          {hasNextPage && (
            <div className="text-center mt-3">
              <button 
                className="btn btn-outline-info btn-sm" 
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Friends;
