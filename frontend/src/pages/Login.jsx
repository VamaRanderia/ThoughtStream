import { useState } from "react";
import { login } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";

function Login(){
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAlert({
      type: "",
      message: "",
    });

    if (!validateForm()) {
      return;
    }

    try {
      const data = await login(formData);

      setAlert({
        type: "success",
        message: "Login successful!",
      });

      setTimeout(() => {
        if (data.user?.isProfileComplete) {
          navigate("/dashboard");
        } else {
          navigate("/complete-profile");
        }
      }, 1000);

    } catch (error) {
      const message = error.response?.data?.message || error.message;
      setAlert({
        type: "danger",
        message: message || "Invalid email or password.",
      });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="logo">ThoughtStream</h1>
        <h3 className="auth-title">Welcome Back</h3>

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

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <input
              className="form-control"
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <p className="error-text">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <input
              className="form-control"
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && (
              <p className="error-text">{errors.password}</p>
            )}
          </div>

          <button type="submit" className="btn-accent">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
