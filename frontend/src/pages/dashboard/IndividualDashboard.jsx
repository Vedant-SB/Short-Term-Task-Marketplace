import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function IndividualDashboard() {

  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [taskFilter, setTaskFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications =
      async () => {

        try {

          const response =
            await api.get(
              "/applications/my-applications"
            );

          setApplications(response.data.applications);
          setFilteredApplications(response.data.applications);

        } catch (error) {

          console.log(error);

        } finally {

          setLoading(false);

        }

      };

    fetchApplications();

  }, []);

  useEffect(() => {

    if (filter === "all") {
      setFilteredApplications(applications);
    } else {

      const filtered =
        applications.filter(application =>
          application.status === filter);

      setFilteredApplications(filtered);

    }

  }, [filter, applications]);

  const getDaysLeft = (task) => {

    if (
      !task ||
      !task.createdAt ||
      !task.duration
    ) {
      return null;
    }

    const createdDate =
      new Date(task.createdAt);

    const deadline =
      new Date(createdDate);

    deadline.setDate(
      deadline.getDate() +
      Number(task.duration)
    );

    const today = new Date();

    return Math.ceil(
      (deadline - today) /
      (1000 * 60 * 60 * 24)
    );

  };

  const totalApplications =
    applications.length;

  const pendingApplications =
    applications.filter(app => app.status === "pending").length;

  const acceptedApplications =
    applications.filter(
      app => app.status === "accepted"
    ).length;

  const rejectedApplications =
    applications.filter(
      app => app.status === "rejected"
    ).length;

  const acceptedTaskApplications =
    applications.filter(
      app =>
        app.status === "accepted" &&
        app.taskId
    );

  const filteredMyTasks =
    acceptedTaskApplications.filter(
      (application) => {
        if (taskFilter === "all") {
          return true;
        }

        return application.taskId?.status === taskFilter;
      }
    );

  const activeTaskFilterLabel = {
    all: "All",
    in_progress: "In Progress",
    under_review: "Under Review",
    revision_requested: "Revision Requested",
    completed: "Completed",
  }[taskFilter] || "All";

  const pendingReviews =
    acceptedTaskApplications.filter(
      app =>
        app.taskId?.status === "completed" &&
        app.taskId?.reviewStatus?.companyReviewSubmitted &&
        !app.taskId?.reviewStatus?.individualReviewSubmitted
    ).length;

  const completedReviews =
    acceptedTaskApplications.filter(
      app =>
        app.taskId?.status === "completed" &&
        app.taskId?.reviewStatus?.individualReviewSubmitted
    ).length;

  const priorityTasks =
    [...acceptedTaskApplications]
      .filter(
        app =>
          app.taskId?.status === "in_progress" ||
          app.taskId?.status === "revision_requested"
      )
      .sort((a, b) => {

        const daysA =
          getDaysLeft(a.taskId);

        const daysB =
          getDaysLeft(b.taskId);

        return daysA - daysB;

      })
      .slice(0, 3);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>

      <h1>
        Individual Dashboard
      </h1>

      <hr />

      <h2>Statistics</h2>

      <p>
        Total Applications:
        {totalApplications}
      </p>

      <p>
        Pending:
        {pendingApplications}
      </p>

      <p>
        Accepted:
        {acceptedApplications}
      </p>

      <p>
        Rejected:
        {rejectedApplications}
      </p>

      <hr />

      <h2>
        Recent Updates
      </h2>

      {applications.length === 0 ? (

        <p>
          No recent activity.
        </p>

      ) : (

        applications
          .slice(0, 5)
          .map(application => (

            <p key={application._id}>

              {application.taskId?.title}
              {" - "}
              {application.status}

            </p>

          ))

      )}

      <hr />

      <h2>
        Priority Tasks
      </h2>

      {priorityTasks.length === 0 ? (

        <p>
          No urgent tasks right now.
        </p>

      ) : (

        priorityTasks.map(
          application => {

            const daysLeft =
              getDaysLeft(
                application.taskId
              );

            return (

              <div
                key={application._id}
                style={{
                  border:
                    "1px solid black",
                  padding: "10px",
                  marginBottom:
                    "10px",
                }}
              >

                <h3>
                  {application.taskId?.title}
                </h3>

                <p>
                  Status:{" "}
                  {application.taskId?.status === "revision_requested"
                    ? "Revision Requested"
                    : application.taskId?.status
                  }
                </p>

                <p>
                  Deadline:
                  {
                    daysLeft === null
                      ? " N/A"
                      : daysLeft < 0
                        ? " Overdue"
                        : ` ${daysLeft} days left`
                  }
                </p>

                <Link
                  to={`/tasks/${application.taskId._id}`}
                >
                  View Details
                </Link>

                {application.taskId?.status ===
                  "in_progress" && (

                  <>
                    {" | "}
                    <Link
                      to={`/tasks/${application.taskId._id}/submit`}
                    >
                      Submit Work
                    </Link>
                  </>

                )}

                {application.taskId?.status ===
                  "revision_requested" && (

                  <>
                    {" | "}
                    <Link
                      to={`/tasks/${application.taskId._id}/submit`}
                    >
                      Resubmit Work
                    </Link>
                  </>

                )}

              </div>

            );

          }
        )

      )}

      <hr />

      {/* =============================== */}
      {/* MY TASKS (unified section)       */}
      {/* =============================== */}

      <h2>
        My Tasks
      </h2>

      <button
        onClick={() => setTaskFilter("all")}
      >
        All
      </button>

      <button
        onClick={() => setTaskFilter("in_progress")}
      >
        In Progress
      </button>

      <button
        onClick={() => setTaskFilter("under_review")}
      >
        Under Review
      </button>

      <button
        onClick={() => setTaskFilter("revision_requested")}
      >
        Revision Requested
      </button>

      <button
        onClick={() => setTaskFilter("completed")}
      >
        Completed
      </button>

      <h3>
        Showing: {activeTaskFilterLabel} Tasks
      </h3>

      <p>
        Pending Reviews: {pendingReviews}
      </p>

      <p>
        Completed Reviews: {completedReviews}
      </p>

      {filteredMyTasks.length === 0 ? (

        <p>
          You haven't been assigned any tasks yet.
        </p>

      ) : (

        filteredMyTasks.map(
          application => {

            const taskStatus =
              application.taskId?.status;

            return (

              <div
                key={application._id}
                style={{
                  border:
                    "1px solid black",
                  padding: "10px",
                  marginBottom:
                    "10px",
                }}
              >

                <h3>
                  {application.taskId?.title}
                </h3>

                <p>
                  Status:{" "}
                  {taskStatus === "revision_requested"
                    ? "Revision Requested"
                    : taskStatus
                  }
                </p>

                <Link
                  to={`/tasks/${application.taskId._id}`}
                >
                  View Details
                </Link>

                {taskStatus === "in_progress" && (

                  <>
                    {" | "}
                    <Link
                      to={`/tasks/${application.taskId._id}/submit`}
                    >
                      Submit Work
                    </Link>
                  </>

                )}

                {taskStatus === "revision_requested" && (

                  <>

                    <p>
                      <strong>Reason:</strong>{" "}
                      {application.taskId?.revisionReason}
                    </p>

                    <p>
                      <strong>Expected Changes:</strong>{" "}
                      {application.taskId?.revisionExpectedChanges}
                    </p>

                    <Link
                      to={`/tasks/${application.taskId._id}/submit`}
                    >
                      Resubmit Work
                    </Link>

                  </>

                )}

                {taskStatus === "under_review" && (

                  <p>
                    Waiting for Review
                  </p>

                )}

                {taskStatus === "completed" && (

                  <>

                    <p>
                      Task Completed
                    </p>

                    {application.taskId?.reviewStatus?.companyReviewSubmitted ? (

                      <p>
                        Company Review Submitted
                      </p>

                    ) : (

                      <p>
                        Waiting for Company Review
                      </p>

                    )}

                    {application.taskId?.reviewStatus?.companyReviewSubmitted &&
                      !application.taskId?.reviewStatus?.individualReviewSubmitted && (
                      <>
                        <p>
                          Pending Review
                        </p>

                        <Link
                          to={`/tasks/${application.taskId._id}/review`}
                        >
                          Review Company
                        </Link>
                      </>
                    )}

                    {application.taskId?.reviewStatus?.individualReviewSubmitted && (

                      <p>
                        Individual Review Submitted
                      </p>

                    )}

                  </>

                )}

              </div>

            );

          }
        )

      )}

      <hr />

      {/* =============================== */}
      {/* APPLICATIONS                     */}
      {/* =============================== */}

      <h2>
        Applications
      </h2>

      <button
        onClick={() =>
          setFilter("all")
        }
      >
        All
      </button>

      <button
        onClick={() =>
          setFilter("pending")
        }
      >
        Pending
      </button>

      <button
        onClick={() =>
          setFilter("rejected")
        }
      >
        Rejected
      </button>

      <br />
      <br />

      <h3>
        {
          filter === "all"
            ? "All Applications"
            : `${filter} Applications`
        }
      </h3>

      {filteredApplications.length === 0 ? (

        <p>
          {filter === "all"
            ? "You haven't applied to any tasks yet."
            : `No ${filter} applications found.`
          }
        </p>

      ) : (

        filteredApplications.map(
          application => (

            <div
              key={application._id}
              style={{
                border:
                  "1px solid black",
                padding: "10px",
                marginBottom:
                  "10px",
              }}
            >

              <h3>
                {
                  application.taskId
                    ?.title
                }
              </h3>

              <p>
                Company:
                {
                  application.taskId
                    ?.postedBy
                    ?.companyName
                }
              </p>

              <p>
                Status:
                {
                  application.status
                }
              </p>

              <Link
                to={`/tasks/${application.taskId?._id}`}
              >
                View Details
              </Link>

            </div>

          )
        )

      )}

    </div>
  );
}

export default IndividualDashboard;
