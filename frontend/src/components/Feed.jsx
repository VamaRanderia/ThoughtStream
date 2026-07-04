import { useEffect, useState } from "react";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import { getCurrentUser } from "../services/authService";
import { getPosts } from "../services/postService";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const handlePostCreated = (post) => {
    setPosts((prevPosts) => [post, ...prevPosts]);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchFeed = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [currentUserData, postData] = await Promise.all([
          getCurrentUser(),
          getPosts()
        ]);

        if (isMounted) {
          setCurrentUserId(currentUserData.user?.id || currentUserData.user?._id || "");
          setPosts(postData);
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

  if (isLoading) {
    return (
      <>
        <CreatePost onPostCreated={handlePostCreated} />
        <div className="feed-state">
          Loading feed...
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <CreatePost onPostCreated={handlePostCreated} />
        <div className="feed-state feed-error">
          {error}
        </div>
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <>
        <CreatePost onPostCreated={handlePostCreated} />
        <div className="feed-state">
          No posts yet.
        </div>
      </>
    );
  }

  return (
    <>
      <CreatePost onPostCreated={handlePostCreated} />
      <section className="feed-list" aria-label="Global feed">
        {posts.map((post) => (
          <PostCard
            key={post._id || post.id}
            post={post}
            currentUserId={currentUserId}
          />
        ))}
      </section>
    </>
  );
}

export default Feed;
