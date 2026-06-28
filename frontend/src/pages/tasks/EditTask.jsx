import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import {
  CATEGORIES,
  DURATIONS,
  ELIGIBLE_OPTIONS,
} from "./taskFormConstants";

function EditTask() {

  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    skillsRequired: "",
    eligibleFor: [],
    budget: "",
    duration: "",
    applicationDeadline: "",
    deliverables: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {

    const fetchTask = async () => {

      try {

        const response = await api.get(
          `/tasks/${id}`
        );

        const task = response.data.task;

        if (task.status !== "open") {
          setError("Can only edit open tasks");
          setLoading(false);
          return;
        }

        if (response.data.applicationCount > 0) {
          setError(
            "Cannot edit task with existing applications"
          );
          setLoading(false);
          return;
        }

        setFormData({
          title: task.title || "",
          description: task.description || "",
          category: task.category || "",
          skillsRequired:
            (task.skillsRequired || []).join(", "),
          eligibleFor: task.eligibleFor || [],
          budget: task.budget || "",
          duration: task.duration || "",
          applicationDeadline: task.applicationDeadline
            ? new Date(task.applicationDeadline).toISOString().split("T")[0]
            : "",
          deliverables: task.deliverables || "",
        });

      } catch (err) {

        setError(
          err.response?.data?.message ||
          "Failed to load task"
        );

      } finally {

        setLoading(false);

      }

    };

    fetchTask();

  }, [id]);

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
        applicationDeadline: formData.applicationDeadline,
      };

      const response = await api.put(
        `/tasks/${id}`,
        payload
      );

      setMessage(
        response.data.message
      );

      setTimeout(() => {
        navigate(`/tasks/${id}`);
      }, 1500);

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Failed to update task"
      );

    } finally {

      setSubmitting(false);

    }

  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error && !formData.title) {
    return (
      <div>
        <h1>Edit Task</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div>

      <h1>
        Edit Task
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
          <label>Application Closing Date</label>
          <br />
          <input
            type="date"
            name="applicationDeadline"
            value={formData.applicationDeadline}
            onChange={handleChange}
            required
          />
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
            ? "Saving..."
            : "Save Changes"
          }
        </button>

      </form>

    </div>
  );
}

export default EditTask;
