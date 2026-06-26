import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CATEGORIES = [
  "Development",
  "Design",
  "Data",
  "Writing",
  "Research",
  "Marketing",
  "Other",
];

const DURATIONS = [3, 4, 5, 6, 7];

const ELIGIBLE_OPTIONS = [
  {
    group: "Students",
    options: [
      { value: "first_year_student", label: "First Year Student" },
      { value: "second_year_student", label: "Second Year Student" },
      { value: "third_year_student", label: "Third Year Student" },
      { value: "final_year_student", label: "Final Year Student" },
      { value: "fresh_graduate", label: "Fresh Graduate" },
    ],
  },
  {
    group: "Professionals",
    options: [
      { value: "professional", label: "Professional" },
      { value: "freelancer", label: "Freelancer" },
    ],
  },
];

function CreateTask() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    skillsRequired: "",
    eligibleFor: [],
    budget: "",
    duration: "",
    deliverables: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEligibleChange = (value) => {

    setFormData((prev) => {

      const current = prev.eligibleFor;

      if (current.includes(value)) {
        return {
          ...prev,
          eligibleFor: current.filter(
            (v) => v !== value
          ),
        };
      }

      return {
        ...prev,
        eligibleFor: [...current, value],
      };

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setSubmitting(true);
    setError("");
    setMessage("");

    try {

      const payload = {
        ...formData,
        skillsRequired: formData.skillsRequired
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        budget: Number(formData.budget),
        duration: Number(formData.duration),
      };

      const response = await api.post(
        "/tasks",
        payload
      );

      setMessage(
        response.data.message
      );

      setTimeout(() => {
        navigate("/company-dashboard");
      }, 1500);

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Failed to create task"
      );

    } finally {

      setSubmitting(false);

    }

  };

  return (
    <div>

      <h1>
        Create Task
      </h1>

      {message && (
        <p style={{ color: "green" }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        <div>
          <label>Title</label>
          <br />
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Task title"
            required
          />
        </div>

        <br />

        <div>
          <label>Description</label>
          <br />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            cols="50"
            placeholder="Describe the task in detail"
            required
          />
        </div>

        <br />

        <div>
          <label>Category</label>
          <br />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Category
            </option>

            {CATEGORIES.map((cat) => (
              <option
                key={cat}
                value={cat}
              >
                {cat}
              </option>
            ))}
          </select>
        </div>

        <br />

        <div>
          <label>
            Skills Required
          </label>
          <br />
          <input
            type="text"
            name="skillsRequired"
            value={formData.skillsRequired}
            onChange={handleChange}
            placeholder="React, Node.js, MongoDB"
          />
          <br />
          <small>
            Comma-separated list
          </small>
        </div>

        <br />

        <div>
          <label>
            Eligible For
          </label>
          <br />

          {ELIGIBLE_OPTIONS.map(
            (group) => (

              <div key={group.group}>

                <strong>
                  {group.group}
                </strong>

                <br />

                {group.options.map(
                  (option) => (

                    <label
                      key={option.value}
                      style={{
                        marginRight: "15px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.eligibleFor.includes(
                          option.value
                        )}
                        onChange={() =>
                          handleEligibleChange(
                            option.value
                          )
                        }
                      />
                      {" "}
                      {option.label}
                    </label>

                  )
                )}

                <br />

              </div>

            )
          )}

          <small>
            Leave unchecked to allow everyone
          </small>
        </div>

        <br />

        <div>
          <label>Budget (₹)</label>
          <br />
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="0"
            min="0"
          />
        </div>

        <br />

        <div>
          <label>Duration (days)</label>
          <br />
          <select
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Duration
            </option>

            {DURATIONS.map((d) => (
              <option
                key={d}
                value={d}
              >
                {d} days
              </option>
            ))}
          </select>
        </div>

        <br />

        <div>
          <label>Deliverables</label>
          <br />
          <textarea
            name="deliverables"
            value={formData.deliverables}
            onChange={handleChange}
            rows="3"
            cols="50"
            placeholder="What should be delivered?"
            required
          />
        </div>

        <br />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Creating..."
            : "Create Task"
          }
        </button>

      </form>

    </div>
  );
}

export default CreateTask;