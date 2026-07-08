import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import PostCard from "../components/PostCard";
import { getCurrentUser } from "../services/authService";
import { deletePost, getPosts, toggleLikePost } from "../services/postService";
import { updateProfile } from "../services/profileService";
import { useImageModal } from "../context/ImageModalContext";

function Profile() {
  const [user, setUser] = useState(null);
  const { openImageModal } = useImageModal();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingPostId, setDeletingPostId] = useState("");
  const [postPendingDelete, setPostPendingDelete] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    bio: "",
    location: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [removePicture, setRemovePicture] = useState(false);
  const [editError, setEditError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [showRemovePhotoModal, setShowRemovePhotoModal] = useState(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);

  // Cleanup preview URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleOpenEditModal = () => {
    setEditFormData({
      bio: user?.bio || "",
      location: user?.location || ""
    });
    setSelectedFile(null);
    setPreviewUrl(user?.profilePicture || "");
    setRemovePicture(false);
    setEditError("");
    setShowEditModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type and size
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setEditError("Only JPG, JPEG, and PNG files are allowed.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      setEditError("File size must be less than 5 MB.");
      return;
    }

    setEditError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemovePicture(false);
  };

  const handleRemovePicture = () => {
    setShowRemovePhotoModal(true);
  };

  const handleConfirmRemovePhoto = async () => {
    setIsRemovingPhoto(true);
    setEditError("");

    try {
      const data = await updateProfile({
        removePicture: true
      });
      setUser(data.user);
      setPreviewUrl("");
      setSelectedFile(null);
      setShowRemovePhotoModal(false);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to remove profile picture.");
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setEditError("");

    try {
      const data = await updateProfile({
        bio: editFormData.bio,
        location: editFormData.location,
        removePicture: removePicture,
        profilePictureFile: selectedFile
      });
      setUser(data.user);
      setShowEditModal(false);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeletePost = (postId) => {
    const post = posts.find((item) => (item._id || item.id) === postId);
    setPostPendingDelete(post || { _id: postId });
    setDeleteError("");
  };

  const handleCloseDeleteModal = () => {
    if (!deletingPostId) {
      setPostPendingDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    const postId = postPendingDelete?._id || postPendingDelete?.id;

    if (!postId) {
      return;
    }

    setDeletingPostId(postId);
    setDeleteError("");

    try {
      await deletePost(postId);
      setPosts((prevPosts) =>
        prevPosts.filter((post) => (post._id || post.id) !== postId)
      );
      setPostPendingDelete(null);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Unable to delete post.");
    } finally {
      setDeletingPostId("");
    }
  };

  const handleToggleLike = async (postId) => {
    const currentUserId = user?.id || user?._id || "";
    if (!currentUserId) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if ((post._id || post.id) === postId) {
          const likes = Array.isArray(post.likes) ? post.likes : [];
          const isAlreadyLiked = likes.some((like) => {
            const likeId = typeof like === "string" ? like : like?._id || like?.id;
            return likeId === currentUserId;
          });

          const newLikes = isAlreadyLiked
            ? likes.filter((like) => (typeof like === "string" ? like : like?._id || like?.id) !== currentUserId)
            : [...likes, currentUserId];

          return { ...post, likes: newLikes };
        }
        return post;
      })
    );

    try {
      const data = await toggleLikePost(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if ((post._id || post.id) === postId) {
            return { ...post, likes: data.likes };
          }
          return post;
        })
      );
    } catch (err) {
      console.error("Failed to toggle like:", err);
      // Revert optimistic update
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if ((post._id || post.id) === postId) {
            const likes = Array.isArray(post.likes) ? post.likes : [];
            const isAlreadyLiked = likes.some((like) => {
              const likeId = typeof like === "string" ? like : like?._id || like?.id;
              return likeId === currentUserId;
            });

            const newLikes = isAlreadyLiked
              ? likes.filter((like) => (typeof like === "string" ? like : like?._id || like?.id) !== currentUserId)
              : [...likes, currentUserId];

            return { ...post, likes: newLikes };
          }
          return post;
        })
      );
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchProfileAndPosts = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [currentUserData, postData] = await Promise.all([
          getCurrentUser(),
          getPosts()
        ]);

        if (isMounted) {
          const loggedInUser = currentUserData.user;
          setUser(loggedInUser);

          const currentUserId = loggedInUser?.id || loggedInUser?._id || "";
          const userSpecificPosts = postData.filter(
            (post) => {
              const authorId = post.author?._id || post.author?.id || post.author;
              return authorId === currentUserId;
            }
          );
          setPosts(userSpecificPosts);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Unable to load profile.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfileAndPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div className="feed-state">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div className="feed-state feed-error">{error}</div>
        </div>
      </div>
    );
  }

  const avatarSrc = user?.profilePicture?.trim();
  const joinedDate = user?.createdAt
    ? new Intl.DateTimeFormat("en", {
        month: "long",
        year: "numeric"
      }).format(new Date(user.createdAt))
    : "";

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-content">
        <div className="profile-header-card">
          <div 
            className={`profile-avatar-large ${avatarSrc ? "clickable" : ""}`} 
            aria-hidden="true"
            onClick={() => avatarSrc && openImageModal(avatarSrc)}
            title={avatarSrc ? "Click to view full image" : ""}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="" />
            ) : (
              <i className="bi bi-person-fill" style={{ fontSize: "2.8rem" }}></i>
            )}
          </div>

          <div className="profile-details">
            <div className="profile-title-row">
              <h2 className="profile-username">{user?.username || "Unknown User"}</h2>
              <button className="btn-edit-profile" onClick={handleOpenEditModal}>
                <i className="bi bi-pencil me-2"></i>Edit Profile
              </button>
            </div>
            <p className="profile-bio">{user?.bio || "No bio added yet."}</p>
            
            <div className="profile-stats">
              {user?.location && (
                <div className="profile-stat-item">
                  <i className="bi bi-geo-alt me-2 text-accent"></i>
                  <span>{user.location}</span>
                </div>
              )}
              {joinedDate && (
                <div className="profile-stat-item">
                  <i className="bi bi-calendar3 me-2 text-accent"></i>
                  <span>Joined {joinedDate}</span>
                </div>
              )}
              <div className="profile-stat-item">
                <i className="bi bi-chat-left-text me-2 text-accent"></i>
                <span><strong>{posts.length}</strong> {posts.length === 1 ? "Post" : "Posts"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-feed-section">
          <h3 className="profile-posts-title">My Posts</h3>
          
          {deleteError && (
            <div className="feed-inline-error">{deleteError}</div>
          )}

          {posts.length === 0 ? (
            <div className="feed-state">You haven't posted anything yet.</div>
          ) : (
            <section className="feed-list" aria-label="User posts feed">
              {posts.map((post) => (
                <PostCard
                  key={post._id || post.id}
                  post={post}
                  currentUserId={user?.id || user?._id || ""}
                  onDeletePost={handleDeletePost}
                  isDeleting={deletingPostId === (post._id || post.id)}
                  onToggleLike={handleToggleLike}
                />
              ))}
            </section>
          )}
        </div>
      </div>

      {postPendingDelete && (
        <>
          <div
            className="modal fade show delete-post-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-post-modal-title"
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content delete-post-modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="delete-post-modal-title">
                    Delete post
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    aria-label="Close"
                    onClick={handleCloseDeleteModal}
                    disabled={Boolean(deletingPostId)}
                  ></button>
                </div>

                <div className="modal-body">
                  Are you sure you want to delete this post?
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseDeleteModal}
                    disabled={Boolean(deletingPostId)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleConfirmDelete}
                    disabled={Boolean(deletingPostId)}
                  >
                    {deletingPostId ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            onClick={handleCloseDeleteModal}
          ></div>
        </>
      )}

      {showEditModal && (
        <>
          <div
            className="modal fade show edit-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-modal-title"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content delete-post-modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="edit-profile-modal-title">
                    Edit Profile
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    aria-label="Close"
                    onClick={() => setShowEditModal(false)}
                    disabled={isSavingProfile}
                  ></button>
                </div>

                <form onSubmit={handleSaveProfile}>
                  <div className="modal-body">
                    {editError && (
                      <div className="alert alert-danger py-2 mb-3">{editError}</div>
                    )}

                    <div className="mb-4 text-center">
                      <div className="profile-avatar-large mx-auto mb-3" aria-hidden="true" style={{ width: "90px", height: "90px" }}>
                        {previewUrl ? (
                          <img src={previewUrl} alt="" />
                        ) : (
                          <i className="bi bi-person-fill" style={{ fontSize: "2.5rem", color: "var(--text-secondary)" }}></i>
                        )}
                      </div>
                      
                      <div className="d-flex justify-content-center gap-2">
                        <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", borderRadius: "20px" }}>
                          Upload new photo
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                          />
                        </label>
                        {previewUrl && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ borderRadius: "20px" }}
                            onClick={handleRemovePicture}
                          >
                            Remove photo
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="bio-input" className="form-label text-secondary small">Bio</label>
                      <textarea
                        id="bio-input"
                        className="form-control bg-dark border-secondary text-light"
                        rows="3"
                        name="bio"
                        placeholder="Tell us about yourself..."
                        value={editFormData.bio}
                        onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                        maxLength="160"
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="location-input" className="form-label text-secondary small">Location</label>
                      <input
                        id="location-input"
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        name="location"
                        placeholder="e.g. San Francisco, CA"
                        value={editFormData.location}
                        onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
                      disabled={isSavingProfile}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-accent"
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            onClick={() => !isSavingProfile && setShowEditModal(false)}
          ></div>
        </>
      )}

      {showRemovePhotoModal && (
        <>
          <div
            className="modal fade show delete-post-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-photo-modal-title"
            style={{ display: "block", zIndex: 1100 }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content delete-post-modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="remove-photo-modal-title">
                    Remove profile photo
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    aria-label="Close"
                    onClick={() => setShowRemovePhotoModal(false)}
                    disabled={isRemovingPhoto}
                  ></button>
                </div>

                <div className="modal-body">
                  Are you sure you want to remove the photo?
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowRemovePhotoModal(false)}
                    disabled={isRemovingPhoto}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleConfirmRemovePhoto}
                    disabled={isRemovingPhoto}
                  >
                    {isRemovingPhoto ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1090 }}
            onClick={() => !isRemovingPhoto && setShowRemovePhotoModal(false)}
          ></div>
        </>
      )}
    </div>
  );
}

export default Profile;
