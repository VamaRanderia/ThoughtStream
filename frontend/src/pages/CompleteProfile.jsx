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
        <div>

            <h1>Complete Your Profile</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="bio"
                    placeholder="Bio"
                    value={formData.bio}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="text"
                    name="profilePicture"
                    placeholder="Profile Picture URL"
                    value={formData.profilePicture}
                    onChange={handleChange}
                />

                <br /><br />

                <button type="submit">
                    Save Profile
                </button>

            </form>

        </div>
    );
}

export default CompleteProfile;