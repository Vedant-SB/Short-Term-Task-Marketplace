import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import {
  CATEGORIES,
  DURATIONS,
  ELIGIBLE_OPTIONS,
} from "./taskFormConstants";

const createListWithOneEmptyItem = () => [""];

const trimAndFilterList = (values) =>
  values
    .map((value) => value.trim())
    .filter(Boolean);

const normalizeToEditableList = (value) => {
  if (Array.isArray(value) && value.length > 0) {
    return value.map((item) => String(item ?? ""));
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return createListWithOneEmptyItem();
};

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
    deliverables: createListWithOneEmptyItem(),
    eligibilityAndPreferences: createListWithOneEmptyItem(),
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
          deliverables: normalizeToEditableList(task.deliverables),
          eligibilityAndPreferences: normalizeToEditableList(task.eligibilityAndPreferences),
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

  const handleDynamicListItemChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, itemIndex) =>
        itemIndex === index ? value : item
      ),
    }));
  };

  const handleAddListItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const handleRemoveListItem = (field, index) => {
    setFormData((prev) => {
      const next = prev[field].filter((_, itemIndex) => itemIndex !== index);

      return {
        ...prev,
        [field]: next.length > 0 ? next : createListWithOneEmptyItem(),
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
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        skillsRequired: formData.skillsRequired
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        budget: Number(formData.budget),
        duration: Number(formData.duration),
        applicationDeadline: formData.applicationDeadline,
        deliverables: trimAndFilterList(formData.deliverables),
        eligibilityAndPreferences: trimAndFilterList(formData.eligibilityAndPreferences),
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
          <label>Application Deadline</label>
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
          {formData.deliverables.map((deliverable, index) => (
            <div key={`deliverable-${index}`} style={{ marginBottom: "8px" }}>
              <input
                type="text"
                value={deliverable}
                onChange={(e) =>
                  handleDynamicListItemChange("deliverables", index, e.target.value)
                }
                placeholder="Enter deliverable"
              />
              {" "}
              <button
                type="button"
                onClick={() => handleRemoveListItem("deliverables", index)}
              >
                Remove Deliverable
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddListItem("deliverables")}
          >
            Add Deliverable
          </button>
        </div>

        <br />

        <div>
          <label>Eligibility & Preferences</label>
          <br />
          {formData.eligibilityAndPreferences.map((entry, index) => (
            <div key={`eligibility-preference-${index}`} style={{ marginBottom: "8px" }}>
              <input
                type="text"
                value={entry}
                onChange={(e) =>
                  handleDynamicListItemChange("eligibilityAndPreferences", index, e.target.value)
                }
                placeholder="Enter eligibility or preference"
              />
              {" "}
              <button
                type="button"
                onClick={() => handleRemoveListItem("eligibilityAndPreferences", index)}
              >
                Remove Entry
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddListItem("eligibilityAndPreferences")}
          >
            Add Entry
          </button>
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
