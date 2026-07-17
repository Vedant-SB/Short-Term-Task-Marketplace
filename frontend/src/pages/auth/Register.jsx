import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";

/* ── Shared input classes ─────────────────────────────────────── */
const inputCls =
  "w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 text-sm text-ink placeholder:text-muted-foreground shadow-sm transition-all duration-200 focus:border-accent focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent/20";
const selectCls =
  "w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 text-sm text-ink shadow-sm transition-all duration-200 focus:border-accent focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent/20 appearance-none cursor-pointer";
const labelCls = "mb-1.5 block text-sm font-medium text-ink";

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "individual",

    email: "",
    password: "",
    confirmPassword: "",

    companyName: "",
    industry: "",
    companyDescription: "",
    website: "",

    individualType: "first_year_student",
    name: "",
    college: "",
    bio: "",
    github: "",
    portfolioWebsite: "",
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
    setError("");
    setMessage("");

    const trimmedData = {
      ...formData,
      email: formData.email.trim(),
      companyName: formData.companyName.trim(),
      industry: formData.industry.trim(),
      companyDescription: formData.companyDescription.trim(),
      website: formData.website.trim(),
      name: formData.name.trim(),
      college: formData.college.trim(),
      bio: formData.bio.trim(),
      github: formData.github.trim(),
      portfolioWebsite: formData.portfolioWebsite.trim(),
      skills: formData.skills.trim(),
      company: formData.company.trim(),
      primaryDomain: formData.primaryDomain.trim(),
    };

    if (!trimmedData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password and confirm password must match");
      return;
    }

    if (trimmedData.role === "company") {
      if (!trimmedData.companyName || !trimmedData.industry || !trimmedData.companyDescription) {
        setError("Company name, industry, and company description are required");
        return;
      }

      if (trimmedData.companyDescription.length < 30 || trimmedData.companyDescription.length > 500) {
        setError("Company description must be between 30 and 500 characters");
        return;
      }

      if (trimmedData.website && !isValidHttpUrl(trimmedData.website)) {
        setError("Website must be a valid URL");
        return;
      }
    }

    if (trimmedData.role === "individual") {
      if (!trimmedData.bio) {
        setError("Bio is required");
        return;
      }

      if (trimmedData.portfolioWebsite && !isValidHttpUrl(trimmedData.portfolioWebsite)) {
        setError("Portfolio website must be a valid URL");
        return;
      }
    }

    try {
      const payload = {
        ...trimmedData,
        password: formData.password,
        skills: trimmedData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      delete payload.confirmPassword;

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
    <>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl text-ink">
          Create Your Account
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Join TaskHub to post, manage, or complete short-term tasks.
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Role selector */}
        <div>
          <label htmlFor="reg-role" className={labelCls}>I am a</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleChange({ target: { name: "role", value: "individual" } })}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                formData.role === "individual"
                  ? "border-accent bg-accent/10 text-accent shadow-sm"
                  : "border-border bg-background/50 text-muted-foreground hover:border-accent/40 hover:text-ink"
              }`}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => handleChange({ target: { name: "role", value: "company" } })}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                formData.role === "company"
                  ? "border-accent bg-accent/10 text-accent shadow-sm"
                  : "border-border bg-background/50 text-muted-foreground hover:border-accent/40 hover:text-ink"
              }`}
            >
              Company
            </button>
          </div>
        </div>

        {/* Shared fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-email" className={labelCls}>Email</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="reg-password" className={labelCls}>Password</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-confirmPassword" className={labelCls}>Confirm Password</label>
          <input
            id="reg-confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={inputCls}
          />
        </div>

        {/* ── Company fields ──────────────────────────────────── */}
        {formData.role === "company" ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="reg-companyName" className={labelCls}>Company Name</label>
              <input
                id="reg-companyName"
                type="text"
                name="companyName"
                placeholder="Acme Corp"
                value={formData.companyName}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-industry" className={labelCls}>Industry</label>
                <input
                  id="reg-industry"
                  type="text"
                  name="industry"
                  placeholder="Technology"
                  value={formData.industry}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="reg-website" className={labelCls}>Website</label>
                <input
                  id="reg-website"
                  type="text"
                  name="website"
                  placeholder="https://acme.com"
                  value={formData.website}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-companyDescription" className={labelCls}>Company Description</label>
              <textarea
                id="reg-companyDescription"
                name="companyDescription"
                placeholder="Tell individuals what your company does, what kind of tasks you post, and what collaboration looks like."
                value={formData.companyDescription}
                onChange={handleChange}
                rows="4"
                className={inputCls}
              />
            </div>
          </div>
        ) : (
          /* ── Individual fields ───────────────────────────────── */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-individualType" className={labelCls}>Type</label>
                <select
                  id="reg-individualType"
                  name="individualType"
                  value={formData.individualType}
                  onChange={handleChange}
                  className={selectCls}
                >
                  <optgroup label="Students">
                    <option value="first_year_student">
                      First Year Student
                    </option>
                    <option value="second_year_student">
                      Second Year Student
                    </option>
                    <option value="third_year_student">
                      Third Year Student
                    </option>
                    <option value="final_year_student">
                      Final Year Student
                    </option>
                    <option value="fresh_graduate">
                      Fresh Graduate
                    </option>
                  </optgroup>
                  <optgroup label="Professionals">
                    <option value="professional">
                      Professional
                    </option>
                    <option value="freelancer">
                      Freelancer
                    </option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label htmlFor="reg-name" className={labelCls}>Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-bio" className={labelCls}>Bio</label>
              <textarea
                id="reg-bio"
                name="bio"
                placeholder="Write a short introduction about yourself"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-github" className={labelCls}>Github</label>
                <input
                  id="reg-github"
                  type="text"
                  name="github"
                  placeholder="github-username"
                  value={formData.github}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="reg-portfolioWebsite" className={labelCls}>Portfolio Website</label>
                <input
                  id="reg-portfolioWebsite"
                  type="text"
                  name="portfolioWebsite"
                  placeholder="https://portfolio.com"
                  value={formData.portfolioWebsite}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-skills" className={labelCls}>Skills</label>
              <input
                id="reg-skills"
                type="text"
                name="skills"
                placeholder="React, Node, MongoDB"
                value={formData.skills}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            {[
              "student",
              "first_year_student",
              "second_year_student",
              "third_year_student",
              "final_year_student",
              "fresh_graduate",
            ].includes(formData.individualType) && (
              <div>
                <label htmlFor="reg-college" className={labelCls}>College</label>
                <input
                  id="reg-college"
                  type="text"
                  name="college"
                  placeholder="University of Technology"
                  value={formData.college}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            )}

            {formData.individualType ===
              "professional" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-company" className={labelCls}>Company</label>
                  <input
                    id="reg-company"
                    type="text"
                    name="company"
                    placeholder="Current employer"
                    value={formData.company}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="reg-experience" className={labelCls}>Experience (years)</label>
                  <input
                    id="reg-experience"
                    type="number"
                    name="yearsOfExperience"
                    placeholder="3"
                    value={
                      formData.yearsOfExperience
                    }
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            {formData.individualType ===
              "freelancer" && (
              <div>
                <label htmlFor="reg-domain" className={labelCls}>Primary Domain</label>
                <input
                  id="reg-domain"
                  type="text"
                  name="primaryDomain"
                  placeholder="Web Development"
                  value={formData.primaryDomain}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-elegant transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift cursor-pointer"
        >
          Register
        </button>
      </form>

      {/* Footer */}
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-accent transition-colors hover:text-ink"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}

export default Register;