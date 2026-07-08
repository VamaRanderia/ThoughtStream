import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../services/profileService";

function CompleteProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bio: "",
    location: ""
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  // Cleanup preview URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type and size
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setAlert({
        type: "danger",
        message: "Only JPG, JPEG, and PNG files are allowed."
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      setAlert({
        type: "danger",
        message: "File size must be less than 5 MB."
      });
      return;
    }

    setAlert({ type: "", message: "" });
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setAlert({
      type: "",
      message: "",
    });

    try {
      await updateProfile({
        bio: formData.bio,
        location: formData.location,
        profilePictureFile: selectedFile
      });

      setAlert({
        type: "success",
        message: "Profile updated successfully!",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error) {
      const message = error.response?.data?.message || error.message;

      setAlert({
        type: "danger",
        message: message || "Failed to update profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="logo">ThoughtStream</h1>
        <h3 className="auth-title">Complete Your Profile</h3>

        {alert.message && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
            {alert.message}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setAlert({ type: "", message: "" })}
            ></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 text-center">
            {previewUrl ? (
              <div className="profile-avatar-preview mb-3">
                <img
                  src={previewUrl}
                  alt="Avatar Preview"
                  className="rounded-circle"
                  style={{ width: "100px", height: "100px", objectFit: "cover", border: "2px solid var(--accent)" }}
                />
              </div>
            ) : (
              <div
                className="profile-avatar-preview mb-3 d-inline-grid place-items-center rounded-circle bg-dark text-secondary mx-auto"
                style={{ width: "100px", height: "100px", border: "2px dashed var(--border)", display: "grid", placeItems: "center" }}
              >
                <i className="bi bi-camera" style={{ fontSize: "2rem" }}></i>
              </div>
            )}
            
            <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", borderRadius: "20px" }}>
              Upload new photo
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <input
            className="form-control mb-3 bg-dark border-secondary text-light"
            type="text"
            name="bio"
            placeholder="Bio"
            value={formData.bio}
            onChange={handleChange}
          />

          <input
            className="form-control mb-4 bg-dark border-secondary text-light"
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
          />

          <button type="submit" className="btn-accent" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfile;