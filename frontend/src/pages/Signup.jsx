import { useState } from "react";
import { signup } from "../services/authService";
import { useNavigate } from "react-router-dom";

function Signup() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Check if passwords match
  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const data = await signup(formData);

    console.log(data);
    localStorage.setItem("token", data.token);

    navigate("/complete-profile");

  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.log(message);

    alert(message || "Signup Failed!");
  }
};

  return (
    <div>
      <h1>Signup</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Enter Name"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <br /><br />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <br/><br/>

        <button type="submit">
          Signup
        </button>
      </form>
    </div>
  );
}

export default Signup;
