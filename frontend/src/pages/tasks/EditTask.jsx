import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Code,
  Users,
  Package,
  Settings,
  Calendar,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import api from "../../api/axios";
import {
  CATEGORIES,
  DURATIONS,
  ELIGIBLE_OPTIONS,
} from "./taskFormConstants";
import {
  PageHeader,
  SectionCard,
  FormSection,
  InputField,
  TextAreaField,
  SelectField,
  DateField,
  PrimaryButton,
  SecondaryButton,
  IconButton,
  Divider,
} from "../../components/ui";

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

const ease = [0.22, 1, 0.36, 1];
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

/* ── Section icon wrapper ─────────────────────────────────── */
function SectionIcon({ icon: Icon, bg = "bg-indigo-50", color = "text-indigo-600" }) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}
    >
      <Icon className="h-4.5 w-4.5" />
    </div>
  );
}

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
        const response = await api.get(`/tasks/${id}`);
        const task = response.data.task;

        if (task.status !== "open") {
          setError("Can only edit open tasks");
          setLoading(false);
          return;
        }

        if (response.data.applicationCount > 0) {
          setError("Cannot edit task with existing applications");
          setLoading(false);
          return;
        }

        setFormData({
          title: task.title || "",
          description: task.description || "",
          category: task.category || "",
          skillsRequired: (task.skillsRequired || []).join(", "),
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
        setError(err.response?.data?.message || "Failed to load task");
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
          eligibleFor: current.filter((v) => v !== value),
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

      const response = await api.put(`/tasks/${id}`, payload);

      setMessage(response.data.message);

      setTimeout(() => {
        navigate(`/tasks/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto w-[94%] max-w-[820px] py-12 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto w-[94%] max-w-[820px] py-12">
          <PageHeader
            title="Edit Task"
            description="Update existing task requirements."
            actions={
              <Link to="/company-dashboard">
                <SecondaryButton>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </SecondaryButton>
              </Link>
            }
          />
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-600 shadow-sm">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />

      <div className="relative mx-auto w-[94%] max-w-[820px] py-8 md:py-12">
        {/* ═══ Page Header ═══════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
        >
          <PageHeader
            title="Edit Task"
            description="Update the task requirements, deliverables, or deadlines."
            actions={
              <Link to={`/tasks/${id}`}>
                <SecondaryButton>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Task Details
                </SecondaryButton>
              </Link>
            }
          />
        </motion.div>

        {/* ═══ Feedback Messages ══════════════════════════════════ */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-semibold text-emerald-700 shadow-sm"
          >
            {message}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm font-semibold text-red-600 shadow-sm"
          >
            {error}
          </motion.div>
        )}

        {/* ═══ Form ══════════════════════════════════════════════ */}
        <form onSubmit={handleSubmit}>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* ── 1. Basic Information ───────────────────────────── */}
            <motion.div variants={fadeUp}>
              <SectionCard>
                <div className="p-6 md:p-8">
                  <FormSection
                    title={
                      <span className="flex items-center gap-3">
                        <SectionIcon
                          icon={FileText}
                          bg="bg-indigo-50"
                          color="text-indigo-600"
                        />
                        Basic Information
                      </span>
                    }
                  >
                    <InputField
                      label="Task Title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Build a Responsive Landing Page in React"
                      required
                    />

                    <TextAreaField
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the task requirements, goals, and details..."
                      rows={5}
                      required
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <SelectField
                        label="Category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="Select Category"
                        options={CATEGORIES}
                        required
                      />

                      <InputField
                        label="Budget (₹)"
                        name="budget"
                        type="number"
                        value={formData.budget}
                        onChange={handleChange}
                        placeholder="e.g. 2000"
                        min="0"
                      />

                      <SelectField
                        label="Duration (days)"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="Select Duration"
                        options={DURATIONS.map((d) => ({
                          value: d,
                          label: `${d} days`,
                        }))}
                        required
                      />
                    </div>
                  </FormSection>
                </div>
              </SectionCard>
            </motion.div>

            {/* ── 2. Required Skills ─────────────────────────────── */}
            <motion.div variants={fadeUp}>
              <SectionCard>
                <div className="p-6 md:p-8">
                  <FormSection
                    title={
                      <span className="flex items-center gap-3">
                        <SectionIcon
                          icon={Code}
                          bg="bg-violet-50"
                          color="text-violet-600"
                        />
                        Required Skills
                      </span>
                    }
                  >
                    <InputField
                      label="Skills Required"
                      name="skillsRequired"
                      value={formData.skillsRequired}
                      onChange={handleChange}
                      placeholder="e.g. React, Node.js, Tailwind CSS, MongoDB"
                      helperText="Enter skills separated by commas"
                    />
                  </FormSection>
                </div>
              </SectionCard>
            </motion.div>

            {/* ── 3. Target Audience & Eligibility ────────────────── */}
            <motion.div variants={fadeUp}>
              <SectionCard>
                <div className="p-6 md:p-8">
                  <FormSection
                    title={
                      <span className="flex items-center gap-3">
                        <SectionIcon
                          icon={Users}
                          bg="bg-blue-50"
                          color="text-blue-600"
                        />
                        Target Audience & Eligibility
                      </span>
                    }
                    description="Select who is eligible to apply for this task."
                  >
                    {ELIGIBLE_OPTIONS.map((group) => (
                      <div key={group.group} className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {group.group}
                        </p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2.5">
                          {group.options.map((option) => (
                            <label
                              key={option.value}
                              className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink transition-colors hover:text-primary"
                            >
                              <input
                                type="checkbox"
                                checked={formData.eligibleFor.includes(
                                  option.value
                                )}
                                onChange={() =>
                                  handleEligibleChange(option.value)
                                }
                                className="h-4 w-4 rounded border-border text-primary accent-primary cursor-pointer"
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <p className="text-xs text-muted-foreground">
                      * Leave all unchecked to allow everyone to apply.
                    </p>
                  </FormSection>
                </div>
              </SectionCard>
            </motion.div>

            {/* ── 4. Deliverables ────────────────────────────────── */}
            <motion.div variants={fadeUp}>
              <SectionCard>
                <div className="p-6 md:p-8">
                  <FormSection
                    title={
                      <span className="flex items-center gap-3">
                        <SectionIcon
                          icon={Package}
                          bg="bg-amber-50"
                          color="text-amber-600"
                        />
                        Deliverables
                      </span>
                    }
                    description="List the specific deliverables expected upon task completion."
                  >
                    <div className="space-y-3">
                      {formData.deliverables.map((deliverable, index) => (
                        <div
                          key={`deliverable-${index}`}
                          className="flex items-center gap-3"
                        >
                          <div className="flex-1">
                            <InputField
                              name={`deliverable-${index}`}
                              value={deliverable}
                              onChange={(e) =>
                                handleDynamicListItemChange(
                                  "deliverables",
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder={`Deliverable #${index + 1} (e.g. Source code repository)`}
                            />
                          </div>
                          <IconButton
                            onClick={() =>
                              handleRemoveListItem("deliverables", index)
                            }
                            className="shrink-0 border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddListItem("deliverables")}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add Deliverable
                    </button>
                  </FormSection>
                </div>
              </SectionCard>
            </motion.div>

            {/* ── 5. Eligibility & Preferences ───────────────────── */}
            <motion.div variants={fadeUp}>
              <SectionCard>
                <div className="p-6 md:p-8">
                  <FormSection
                    title={
                      <span className="flex items-center gap-3">
                        <SectionIcon
                          icon={Settings}
                          bg="bg-orange-50"
                          color="text-orange-600"
                        />
                        Eligibility & Preferences
                      </span>
                    }
                    description="Specify any extra requirements, preferred qualifications, or notes for applicants."
                  >
                    <div className="space-y-3">
                      {formData.eligibilityAndPreferences.map((entry, index) => (
                        <div
                          key={`eligibility-preference-${index}`}
                          className="flex items-center gap-3"
                        >
                          <div className="flex-1">
                            <InputField
                              name={`eligibility-preference-${index}`}
                              value={entry}
                              onChange={(e) =>
                                handleDynamicListItemChange(
                                  "eligibilityAndPreferences",
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder={`Requirement or Preference #${index + 1} (e.g. Prior experience with REST APIs)`}
                            />
                          </div>
                          <IconButton
                            onClick={() =>
                              handleRemoveListItem(
                                "eligibilityAndPreferences",
                                index
                              )
                            }
                            className="shrink-0 border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleAddListItem("eligibilityAndPreferences")
                      }
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add Entry
                    </button>
                  </FormSection>
                </div>
              </SectionCard>
            </motion.div>

            {/* ── 6. Deadlines ───────────────────────────────────── */}
            <motion.div variants={fadeUp}>
              <SectionCard>
                <div className="p-6 md:p-8">
                  <FormSection
                    title={
                      <span className="flex items-center gap-3">
                        <SectionIcon
                          icon={Calendar}
                          bg="bg-emerald-50"
                          color="text-emerald-600"
                        />
                        Deadlines
                      </span>
                    }
                    description="Set the end date for receiving applications."
                  >
                    <div className="max-w-sm">
                      <DateField
                        label="Application Deadline"
                        name="applicationDeadline"
                        value={formData.applicationDeadline}
                        onChange={handleChange}
                        required
                        helperText="Date by which applicants must submit their proposals."
                      />
                    </div>
                  </FormSection>
                </div>
              </SectionCard>
            </motion.div>

            {/* ── Action buttons ─────────────────────────────────── */}
            <motion.div variants={fadeUp}>
              <Divider className="my-2" />
              <div className="flex items-center justify-between pt-2 pb-4">
                <SecondaryButton
                  onClick={() => navigate(`/tasks/${id}`)}
                >
                  Cancel
                </SecondaryButton>

                <PrimaryButton
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </PrimaryButton>
              </div>
            </motion.div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

export default EditTask;
