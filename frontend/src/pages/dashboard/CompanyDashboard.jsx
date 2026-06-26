import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function CompanyDashboard() {

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchTasks = async () => {

      try {

        const response = await api.get(
          "/tasks/my-tasks"
        );

        setTasks(response.data.tasks);
        setFilteredTasks(response.data.tasks);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    fetchTasks();

  }, []);

  useEffect(() => {

    if (filter === "all") {
      setFilteredTasks(tasks);
    } else {

      const filtered = tasks.filter(
        task => task.status === filter
      );

      setFilteredTasks(filtered);

    }

  }, [filter, tasks]);

  const getDaysLeft = (task) => {

    const createdDate = new Date(
      task.createdAt
    );

    const deadline = new Date(
      createdDate
    );

    deadline.setDate(
      deadline.getDate() + task.duration
    );

    const today = new Date();

    const diffTime =
      deadline - today;

    const diffDays = Math.ceil(
      diffTime / (1000 * 60 * 60 * 24)
    );

    return diffDays;

  };

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
        Pending Reviews:
        {pendingReviews}
      </h3>

      <h3>
        Completed Reviews:
        {completedReviews}
      </h3>

      <hr />

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

      <h3>
        Showing: {activeFilterLabel} Tasks
      </h3>

      {filteredTasks.length === 0 ? (
        <p>
          {filter === "all"
            ? "You haven't created any tasks yet."
            : `No ${filter.replace(/_/g, " ")} tasks found.`
          }
        </p>
      ) : (

        filteredTasks.map(
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
                    daysLeft < 0
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