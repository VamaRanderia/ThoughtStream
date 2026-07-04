import { useState } from "react";
import { createPost } from "../services/postService";

const MAX_POST_LENGTH = 500;

function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const remainingCharacters = MAX_POST_LENGTH - content.length;
  const isEmpty = content.trim().length === 0;

  const handleChange = (e) => {
    setContent(e.target.value.slice(0, MAX_POST_LENGTH));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEmpty) {
      setError("Post cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const data = await createPost({ content });
      setContent("");
      onPostCreated(data.post);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="create-post" onSubmit={handleSubmit} noValidate>
      <textarea
        className="create-post-input"
        name="content"
        placeholder="What is happening?"
        value={content}
        onChange={handleChange}
        maxLength={MAX_POST_LENGTH}
        rows="4"
      />

      <div className="create-post-footer">
        <div>
          <span className="create-post-counter">
            {remainingCharacters} characters remaining
          </span>
          {error && (
            <p className="create-post-error">{error}</p>
          )}
        </div>

        <span
          className="create-post-submit-wrap"
          onClick={() => {
            if (isEmpty) {
              setError("Post cannot be empty.");
            }
          }}
        >
          <button
            className="create-post-submit"
            type="submit"
            disabled={isEmpty || isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </span>
      </div>
    </form>
  );
}

export default CreatePost;
