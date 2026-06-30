import { useState } from "react";
import { login } from "../services/authService";

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
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
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

        <br/><br/>

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
