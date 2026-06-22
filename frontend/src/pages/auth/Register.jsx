import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "individual",

    email: "",
    password: "",

    companyName: "",
    industry: "",
    website: "",

    individualType: "student",
    name: "",
    college: "",
    bio: "",
    github: "",
    skills: "",

    company: "",
    yearsOfExperience: "",
    primaryDomain: "",
  });

  const [message, setMessage] = useState("");
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
      const payload = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      await api.post("/auth/register", payload);

      setMessage("Registration Successful");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration Failed"
      );
    }
  };

  return (
    <div>
      <h1>Register</h1>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="individual">
            Individual
          </option>

          <option value="company">
            Company
          </option>
        </select>

        <br />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <br />

        {formData.role === "company" ? (
          <>
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={handleChange}
            />

            <br />

            <input
              type="text"
              name="industry"
              placeholder="Industry"
              value={formData.industry}
              onChange={handleChange}
            />

            <br />

            <input
              type="text"
              name="website"
              placeholder="Website"
              value={formData.website}
              onChange={handleChange}
            />
          </>
        ) : (
          <>
            <select
              name="individualType"
              value={formData.individualType}
              onChange={handleChange}
            >
              <option value="student">
                Student
              </option>

              <option value="professional">
                Professional
              </option>

              <option value="freelancer">
                Freelancer
              </option>
            </select>

            <br />

            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
            />

            <br />

            <input
              type="text"
              name="skills"
              placeholder="React, Node, MongoDB"
              value={formData.skills}
              onChange={handleChange}
            />

            <br />

            {formData.individualType === "student" && (
              <input
                type="text"
                name="college"
                placeholder="College"
                value={formData.college}
                onChange={handleChange}
              />
            )}

            {formData.individualType ===
              "professional" && (
              <>
                <input
                  type="text"
                  name="company"
                  placeholder="Company"
                  value={formData.company}
                  onChange={handleChange}
                />

                <input
                  type="number"
                  name="yearsOfExperience"
                  placeholder="Experience"
                  value={
                    formData.yearsOfExperience
                  }
                  onChange={handleChange}
                />
              </>
            )}

            {formData.individualType ===
              "freelancer" && (
              <input
                type="text"
                name="primaryDomain"
                placeholder="Primary Domain"
                value={formData.primaryDomain}
                onChange={handleChange}
              />
            )}
          </>
        )}

        <br />

        <button type="submit">
          Register
        </button>

      </form>
    </div>
  );
}

export default Register;