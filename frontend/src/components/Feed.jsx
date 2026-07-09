import { useEffect, useState, useRef } from "react";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import { getCurrentUser } from "../services/authService";
import { deletePost, getPosts, toggleLikePost, searchPostsApi } from "../services/postService";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingPostId, setDeletingPostId] = useState("");
  const [postPendingDelete, setPostPendingDelete] = useState(null);

  // Infinite Scroll state
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const observerRef = useRef();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debounceSearchTimeoutRef = useRef(null);

  const handlePostCreated = (post) => {
    setPosts((prevPosts) => [post, ...prevPosts]);
    setDeleteError("");
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
      // Revert optimistic update (apply opposite toggle)
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

  const loadMorePosts = async () => {
    setIsFetchingNextPage(true);
    try {
      let data;
      if (searchQuery.trim()) {
        data = await searchPostsApi(searchQuery.trim(), page + 1, 10);
      } else {
        data = await getPosts(page + 1, 10);
      }
      setPosts((prevPosts) => [...prevPosts, ...(data.posts || [])]);
      setPage((prevPage) => prevPage + 1);
      setHasNextPage(data.hasNextPage || false);
    } catch (err) {
      console.error("Error loading more posts:", err);
    } finally {
      setIsFetchingNextPage(false);
    }
  };

  const handleSearchPostsChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceSearchTimeoutRef.current) {
      clearTimeout(debounceSearchTimeoutRef.current);
    }

    debounceSearchTimeoutRef.current = setTimeout(() => {
      triggerSearch(value.trim());
    }, 400);
  };

  const triggerSearch = async (query) => {
    setIsLoading(true);
    setError("");
    setPage(1);

    try {
      let data;
      if (query) {
        data = await searchPostsApi(query, 1, 10);
      } else {
        data = await getPosts(1, 10);
      }
      setPosts(data.posts || []);
      setHasNextPage(data.hasNextPage || false);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load search results.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceSearchTimeoutRef.current) {
        clearTimeout(debounceSearchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchFeed = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [currentUserData, postData] = await Promise.all([
          getCurrentUser(),
          getPosts(1, 10)
        ]);

        if (isMounted) {
          setCurrentUserId(currentUserData.user?.id || currentUserData.user?._id || "");
          setPosts(postData.posts || []);
          setHasNextPage(postData.hasNextPage || false);
          setPage(1);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Unable to load feed.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFeed();

    return () => {isMounted = false;};
  }, []);

  useEffect(() => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const currentSentinel = observerRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [isLoading, isFetchingNextPage, hasNextPage, page]);

  return (
    <>
      {/* Post Search Input */}
      <div className="mb-4">
        <div className="input-group">
          <span className="input-group-text bg-dark border-secondary text-secondary">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control bg-dark text-white border-secondary"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={handleSearchPostsChange}
          />
        </div>
      </div>

      <CreatePost onPostCreated={handlePostCreated} />
      
      {deleteError && (
        <div className="feed-inline-error">{deleteError}</div>
      )}

      {isLoading ? (
        <div className="feed-state text-center py-4">
          <div className="spinner-border text-info" role="status"></div>
          <div className="mt-2 text-secondary">Loading feed...</div>
        </div>
      ) : error ? (
        <div className="feed-state feed-error">{error}</div>
      ) : posts.length === 0 ? (
        <div className="feed-state">No posts found.</div>
      ) : (
        <>
          <section className="feed-list" aria-label="Global feed">
            {posts.map((post) => (
              <PostCard
                key={post._id || post.id}
                post={post}
                currentUserId={currentUserId}
                onDeletePost={handleDeletePost}
                isDeleting={deletingPostId === (post._id || post.id)}
                onToggleLike={handleToggleLike}
              />
            ))}
          </section>

          {/* Sentinel element for Infinite Scroll */}
          <div ref={observerRef} style={{ height: "20px", margin: "10px 0" }}></div>

          {isFetchingNextPage && (
            <div className="feed-state text-center py-3">
              <div className="spinner-border spinner-border-sm text-info me-2" role="status"></div>
              <span>Loading more posts...</span>
            </div>
          )}
        </>
      )}

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
    </>
  );
}

export default Feed;
