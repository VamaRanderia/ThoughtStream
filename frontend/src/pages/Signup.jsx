import { useState } from "react";
import { signup } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Track dynamic field validation errors
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Step 1: Create an alert state for global messages
  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  // Field validation rules logic
  const validateField = (name, value, data) => {
    switch (name) {
      case "username":
        if (!value.trim()) {
          return "Name is required.";
        }
        if (value.trim().length > 30) {
          return "Name cannot exceed 30 characters.";
        }
        return "";

      case "email":
        if (!value.trim()) {
          return "Email is required.";
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|yahoo)\.com$/;
        if (!emailRegex.test(value)) {
          return "Only Gmail, Outlook or Yahoo email addresses are allowed.";
        }
        return "";

      case "password":
        if (!value) {
          return "Password is required.";
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^# ]).{8,}$/;
        if (!passwordRegex.test(value)) {
          return "Password does not meet the required format.";
        }
        return "";

      case "confirmPassword":
        if (!value) {
          return "Please confirm your password.";
        }
        if (value !== data.password) {
          return "Passwords do not match.";
        }
        return "";

      default:
        return "";
    }
  };

  // Efficient value updating script
  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedData);

    const newErrors = {
      ...errors,
      [name]: validateField(name, value, updatedData),
    };

    if (name === "password") {
      newErrors.confirmPassword = validateField(
        "confirmPassword",
        updatedData.confirmPassword,
        updatedData
      );
    }

    setErrors(newErrors);
  };

  // Complete block compilation validator
  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      newErrors[field] = validateField(
        field,
        formData[field],
        formData
      );
    });

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  // Form submission handling logic
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 4: Reset dynamic application wide notification banners
    setAlert({
      type: "",
      message: "",
    });

    if (!validateForm()) {
      return;
    }

    try {
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Step 3: Trigger a stateful success banner
      setAlert({
        type: "success",
        message: "Account created successfully!",
      });

      // Forward smoothly to login after letting them read the success message
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      const message = err.response?.data?.message || err.message;
      
      // Step 3: Trigger an inline structural error alert banner instead of an alert window pop-up
      setAlert({
        type: "danger",
        message: message || "Signup failed.",
      });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="logo">ThoughtStream</h1>
        <h3 className="auth-title">Create Account</h3>

        {/* Step 2 & Recommended option: Show the Bootstrap dismissible alert above the form */}
        {alert.message && (
          <div
            className={`alert alert-${alert.type} alert-dismissible fade show`}
            role="alert"
          >
            {alert.message}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() =>
                setAlert({
                  type: "",
                  message: "",
                })
              }
            ></button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Username */}
          <div className="mb-3">
            <input
              className="form-control"
              type="text"
              name="username"
              placeholder="Enter Name"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && (
              <p className="error-text">{errors.username}</p>
            )}
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="mb-3">
            <input
              className="form-control"
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <p className="password-note">
              * Password must contain at least 8 characters, one uppercase
              letter, one lowercase letter, one number and one special
              character.
            </p>

            {errors.password && (
              <p className="error-text">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <input
              className="form-control"
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword}</p>
            )}
          </div>

          <button type="submit" className="btn-accent">
            Sign Up
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;