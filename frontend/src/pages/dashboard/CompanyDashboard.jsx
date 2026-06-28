import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function CompanyDashboard() {

  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {

    const fetchData = async () => {

      try {

        const [tasksRes, dashboardRes] =
          await Promise.all([
            api.get("/tasks/my-tasks"),
            api.get("/dashboard/company"),
          ]);

        setTasks(tasksRes.data.tasks);
        setDashboardStats(
          dashboardRes.data.dashboard
        );

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    fetchData();

  }, []);

  const getDaysLeft = (task) => {

    if (!task?.taskDeadline) {
      return null;
    }

    const deadline = new Date(task.taskDeadline);

    const today = new Date();

    const diffTime =
      deadline - today;

    const diffDays = Math.ceil(
      diffTime / (1000 * 60 * 60 * 24)
    );

    return diffDays;

  };

  const handleDelete = async (taskId) => {

    const confirmed = window.confirm(
      "Delete this task?\n\nThis action cannot be undone."
    );

    if (!confirmed || deletingId) return;

    setDeletingId(taskId);

    try {

      await api.delete(
        `/tasks/${taskId}`
      );

      setTasks(
        tasks.filter(
          task => task._id !== taskId
        )
      );

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Failed to delete task"
      );

    } finally {

      setDeletingId(null);

    }

  };

  // ===========================
  // FILTER + SEARCH + SORT
  // ===========================

  let displayTasks = [...tasks];

  // Filter
  if (filter !== "all") {
    displayTasks = displayTasks.filter(
      task => task.status === filter
    );
  }

  // Search
  if (searchQuery.trim()) {
    const query =
      searchQuery.toLowerCase();

    displayTasks = displayTasks.filter(
      task =>
        task.title
          .toLowerCase()
          .includes(query) ||
        task.category
          .toLowerCase()
          .includes(query)
    );
  }

  // Sort
  displayTasks.sort((a, b) => {

    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt) -
          new Date(b.createdAt);
      case "budget":
        return b.budget - a.budget;
      case "status":
        return a.status.localeCompare(
          b.status
        );
      case "newest":
      default:
        return new Date(b.createdAt) -
          new Date(a.createdAt);
    }

  });

  // ===========================
  // COMPUTED STATS
  // ===========================

  const totalTasks = tasks.length;

  const openTasks =
    tasks.filter(
      task => task.status === "open"
    ).length;

  const inProgressTasks =
    tasks.filter(
      task => task.status === "in_progress"
    ).length;

  const underReviewTasks =
    tasks.filter(
      task =>
        task.status ===
        "under_review"
    ).length;

  const revisionRequestedTasks =
    tasks.filter(
      task =>
        task.status ===
        "revision_requested"
    ).length;

  const completedTasks =
    tasks.filter(
      task => task.status === "completed"
    ).length;

  const pendingReviews =
    tasks.filter(
      task =>
        task.status === "completed" &&
        !task.reviewStatus?.companyReviewSubmitted
    ).length;

  const completedReviews =
    tasks.filter(
      task =>
        task.status === "completed" &&
        task.reviewStatus?.companyReviewSubmitted
    ).length;

  const activeFilterLabel = {
    all: "All",
    open: "Open",
    in_progress: "In Progress",
    under_review: "Under Review",
    revision_requested: "Revision Requested",
    completed: "Completed",
  }[filter] || "All";

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>

      <h1>
        Company Dashboard
      </h1>

      {/* =============================== */}
      {/* STATISTICS                       */}
      {/* =============================== */}

      <h3>
        Total Tasks: {totalTasks}
      </h3>

      <h3>
        Open: {openTasks}
      </h3>

      <h3>
        In Progress:
        {inProgressTasks}
      </h3>

      <h3>
        Under Review:
        {underReviewTasks}
      </h3>

      <h3>
        Revision Requested:
        {revisionRequestedTasks}
      </h3>

      <h3>
        Completed:
        {completedTasks}
      </h3>

      <h3>
        Applications Received:{" "}
        {dashboardStats.applicationsReceived || 0}
      </h3>

      <h3>
        Individuals Hired:{" "}
        {dashboardStats.individualsHired || 0}
      </h3>

      <h3>
        Average Rating:{" "}
        {dashboardStats.averageRating || 0}
      </h3>

      <h3>
        Pending Reviews:
        {pendingReviews}
      </h3>

      <h3>
        Completed Reviews:
        {completedReviews}
      </h3>

      <hr />

      {/* =============================== */}
      {/* SEARCH                           */}
      {/* =============================== */}

      <h2>
        Search Tasks
      </h2>

      <input
        type="text"
        placeholder="Search by title or category..."
        value={searchQuery}
        onChange={(e) =>
          setSearchQuery(e.target.value)
        }
      />

      <hr />

      {/* =============================== */}
      {/* FILTER                           */}
      {/* =============================== */}

      <h2>
        Filter Tasks
      </h2>

      <button
        onClick={() => setFilter("all")}
      >
        All
      </button>

      <button
        onClick={() => setFilter("open")}
      >
        Open
      </button>

      <button
        onClick={() =>
          setFilter("in_progress")
        }
      >
        In Progress
      </button>

      <button
        onClick={() =>
          setFilter("under_review")
        }
      >
        Under Review
      </button>

      <button
        onClick={() =>
          setFilter("revision_requested")
        }
      >
        Revision Requested
      </button>

      <button
        onClick={() =>
          setFilter("completed")
        }
      >
        Completed
      </button>

      <hr />

      {/* =============================== */}
      {/* SORT                             */}
      {/* =============================== */}

      <h2>Sort</h2>

      <select
        value={sortBy}
        onChange={(e) =>
          setSortBy(e.target.value)
        }
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="budget">Budget</option>
        <option value="status">Status</option>
      </select>

      <hr />

      <h3>
        Showing: {activeFilterLabel} Tasks
      </h3>

      {displayTasks.length === 0 ? (
        <p>
          {filter === "all"
            ? "You haven't created any tasks yet."
            : `No ${filter.replace(/_/g, " ")} tasks found.`
          }
        </p>
      ) : (

        displayTasks.map(
          (task) => {

            const daysLeft =
              getDaysLeft(task);

            return (

              <div
                key={task._id}
                style={{
                  border:
                    "1px solid black",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >

                <h3>
                  {task.title}
                </h3>

                <p>
                  Status:{" "}
                  {task.status === "revision_requested"
                    ? "Revision Requested"
                    : task.status
                  }
                </p>

                <p>
                  Budget:
                  ₹{task.budget}
                </p>

                <p>
                  Duration:
                  {task.duration} days
                </p>

                <p>
                  Deadline:
                  {
                    daysLeft === null
                      ? " Not started"
                      : daysLeft < 0
                        ? " Overdue"
                        : ` ${daysLeft} days left`
                  }
                </p>

                <Link to={`/tasks/${task._id}`}>
                  View Details
                </Link>

                {task.status === "open" && (
                  <>
                    {" | "}
                    <Link to={`/task-applicants/${task._id}`}>
                      View Applicants
                    </Link>

                    {" | "}

                    <button
                      onClick={() =>
                        handleDelete(task._id)
                      }
                      disabled={deletingId === task._id}
                    >
                      {deletingId === task._id
                        ? "Deleting..."
                        : "Delete"
                      }
                    </button>
                  </>
                )}

                {task.status === "in_progress" &&
                  task.selectedApplicant && (

                  <p>
                    Assigned To:{" "}
                    {task.selectedApplicant.name}
                    {" ("}
                    {task.selectedApplicant.individualType}
                    {")"}
                  </p>

                )}

                {task.status === "under_review" && (
                  <>
                    {" | "}
                    <Link to={`/tasks/${task._id}/review`}>
                      Review Submission
                    </Link>
                  </>
                )}

                {task.status === "completed" &&
                  !task.reviewStatus?.companyReviewSubmitted && (
                  <>
                    <p>
                      Pending Review
                    </p>

                    {" | "}
                    <Link to={`/tasks/${task._id}/review`}>
                      Leave Review
                    </Link>
                  </>
                )}

                {task.status === "completed" &&
                  task.reviewStatus?.companyReviewSubmitted && (
                  <p>
                    Company Review Submitted
                  </p>
                )}

                {task.status === "completed" &&
                  task.reviewStatus?.individualReviewSubmitted && (
                  <p>
                    Individual Review Submitted
                  </p>
                )}

                {task.status === "revision_requested" && (
                  <p>
                    Waiting for resubmission.
                  </p>
                )}

              </div>

            );

          }
        )

      )}

    </div>
  );
}

export default CompanyDashboard;