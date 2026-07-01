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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            await updateProfile(formData);

            alert("Profile updated successfully");

            navigate("/home");

        } catch (error) {

            const message =
                error.response?.data?.message || error.message;

            alert(message);
        }
    };

    return (
  <div className="auth-page">

    <div className="auth-card">

      <h1 className="logo">
        ThoughtStream
      </h1>

      <h3 className="auth-title">
        Complete Your Profile
      </h3>

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

        <button
          type="submit"
          className="btn-accent"
        >
          Save Profile
        </button>

      </form>

    </div>

  </div>
);
}

export default CompleteProfile;