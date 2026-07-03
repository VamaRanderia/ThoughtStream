import { useState } from "react";
import { signup, checkEmail, checkUsername } from "../services/authService";
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

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;

    const currentFieldError = validateField(name, value, formData);

    setErrors((prev) => ({
      ...prev,
      [name]: currentFieldError,
    }));

    if (name === "username" && !currentFieldError && value) {
      try {
        const result = await checkUsername(value);
        if (result.exists) {
          setErrors((prev) => ({
            ...prev,
            username: "Username already exists.",
          }));
        }
      } catch (err) {
        console.log(err);
      }
    }

    if (name === "email" && !currentFieldError && value) {
      try {
        const result = await checkEmail(value);
        if (result.exists) {
          setErrors((prev) => ({
            ...prev,
            email: "Email already exists.",
          }));
        }
      } catch (err) {
        console.log(err);
      }
    }

    if (name === "password" && formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField("confirmPassword", formData.confirmPassword, {
          ...formData,
          password: value,
        }),
      }));
    }
  };

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
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      setAlert({
        type: "success",
        message: "Account created successfully!",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      const message = err.response?.data?.message || err.message;
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
              type="text"
              name="username"
              placeholder="Enter Name"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={30}
              required
            />
            {errors.username && (
              <p className="error-text">{errors.username}</p>
            )}
          </div>

          <div className="mb-3">
            <input
              className="form-control"
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {errors.email && (
              <p className="error-text">{errors.email}</p>
            )}
          </div>

          <div className="mb-3">
            <input
              className="form-control"
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {errors.password && (
              <p className="error-text">{errors.password}</p>
            )}
            <p className="password-note">
              * Password must contain at least 8 characters, one uppercase
              letter, one lowercase letter, one number and one special
              character.
            </p>
          </div>

          <div className="mb-4">
            <input
              className="form-control"
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
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