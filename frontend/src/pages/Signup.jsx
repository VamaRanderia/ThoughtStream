import { useState } from "react";
import { signup } from "../services/authService";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const data = await signup(formData);

    console.log(data);
    localStorage.setItem("token", data.token);

    alert("Signup Successful!");

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

        <button type="submit">
          Signup
        </button>
      </form>
    </div>
  );
}

export default Signup;
