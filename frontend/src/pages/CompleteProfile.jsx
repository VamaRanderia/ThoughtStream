import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../services/profileService";

function CompleteProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    profilePicture: ""
  });

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAlert({
      type: "",
      message: "",
    });

    try {
      await updateProfile(formData);

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
          <input
            className="form-control mb-3"
            type="text"
            name="bio"
            placeholder="Bio"
            value={formData.bio}
            onChange={handleChange}
          />

          <input
            className="form-control mb-3"
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
          />

          <input
            className="form-control mb-4"
            type="text"
            name="profilePicture"
            placeholder="Profile Picture URL"
            value={formData.profilePicture}
            onChange={handleChange}
          />

          <button type="submit" className="btn-accent">
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfile;