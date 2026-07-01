import { useState } from "react";
import { login } from "../services/authService";
import { Link } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
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
    const data = await login(formData);

    console.log(data);

    localStorage.setItem("token", data.token);

    alert("Login Successful!");
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.log(message);

    alert(message || "Invalid Credentials");
  }
};

  return (
  <div className="auth-page">

    <div className="auth-card">

      <h1 className="logo">
        ThoughtStream
      </h1>

      <h3 className="auth-title">
        Welcome Back
      </h3>

      <form onSubmit={handleSubmit}>

        <input
          className="form-control mb-3"
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          className="form-control mb-4"
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="btn-accent"
        >
          Login
        </button>

      </form>

      <p className="auth-footer">
        Don't have an account?{" "}
        <Link to="/signup">Sign Up</Link>
      </p>

    </div>

  </div>
  );
}

export default Login;
