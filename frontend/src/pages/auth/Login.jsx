import { useState } from "react";

import { useNavigate, Link } from "react-router-dom";

import api from "../../api/axios";

import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "/auth/login",
        formData
      );

      login({
        token: response.data.token,
        role: response.data.role,
        userId: response.data.userId,
      });

      if (response.data.role === "company") {
        navigate("/company-dashboard");
      } else {
        navigate("/individual-dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed"
      );
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl text-ink">
          Welcome Back
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to continue managing short-term tasks on TaskHub.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 text-sm text-ink placeholder:text-muted-foreground shadow-sm transition-all duration-200 focus:border-accent focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 text-sm text-ink placeholder:text-muted-foreground shadow-sm transition-all duration-200 focus:border-accent focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-elegant transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift cursor-pointer"
        >
          Login
        </button>
      </form>

      {/* Footer */}
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Don&rsquo;t have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-accent transition-colors hover:text-ink"
        >
          Create one
        </Link>
      </p>
    </>
  );
}

export default Login;
