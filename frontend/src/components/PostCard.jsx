function PostCard({ post, currentUserId, onDeletePost, isDeleting, onToggleLike }) {
  const author = post.author || {};
  const authorId = author._id || author.id;
  const isAuthor = authorId === currentUserId;
  const likes = Array.isArray(post.likes) ? post.likes : [];
  const isLiked = likes.some((like) => {
    const likeId = typeof like === "string" ? like : like?._id || like?.id;
    return likeId === currentUserId;
  });

  const createdDate = post.createdAt
    ? new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(post.createdAt))
    : "";

  const avatarSrc = author.profilePicture?.trim();
  const fallbackInitial = author.username?.charAt(0)?.toUpperCase() || "U";

  return (
    <article className="post-card">
      <div className="post-avatar" aria-hidden="true">
        {avatarSrc ? (
          <img src={avatarSrc} alt="" />
        ) : (
          <span>{fallbackInitial}</span>
        )}
      </div>

      <div className="post-body">
        <div className="post-header">
          <div className="post-author-line">
            <span className="post-username">{author.username || "Unknown user"}</span>
            {createdDate && (
              <span className="post-date">{createdDate}</span>
            )}
          </div>

          {isAuthor && (
            <button
              className="post-delete-btn"
              type="button"
              onClick={() => onDeletePost(post._id || post.id)}
              disabled={isDeleting}
              aria-label="Delete post"
            >
              <i className="bi bi-trash"></i>
            </button>
          )}
        </div>

        <p className="post-content">{post.content}</p>

        <div className="post-actions">
          <button
            className={`post-like-btn ${isLiked ? "liked" : ""}`}
            type="button"
            onClick={() => onToggleLike && onToggleLike(post._id || post.id)}
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            <i className={`bi ${isLiked ? "bi-heart-fill" : "bi-heart"}`}></i>
          </button>
          <span className="post-like-count">{likes.length}</span>
        </div>
      </div>
    </article>
  );
}

export default PostCard;
