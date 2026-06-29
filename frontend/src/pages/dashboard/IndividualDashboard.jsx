import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function IndividualDashboard() {

  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [taskFilter, setTaskFilter] = useState("all");
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [appSearchQuery, setAppSearchQuery] = useState("");
  const [taskSortBy, setTaskSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({});
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {

    const fetchData = async () => {

      try {

        const [appRes, dashRes] =
          await Promise.all([
            api.get(
              "/applications/my-applications"
            ),
            api.get("/dashboard/individual"),
          ]);

        setApplications(appRes.data.applications);
        setDashboardStats(
          dashRes.data.dashboard
        );

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    fetchData();

  }, []);

  const handleWithdraw = async (
    applicationId
  ) => {

    const confirmed = window.confirm(
      "Withdraw this application?"
    );

    if (!confirmed || withdrawingId) return;

    setWithdrawingId(applicationId);

    try {

      await api.put(
        `/applications/${applicationId}/withdraw`
      );

      setApplications(
        applications.filter(
          app => app._id !== applicationId
        )
      );

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Failed to withdraw"
      );

    } finally {

      setWithdrawingId(null);

    }

  };

  const getDaysLeft = (deadline) => {

    if (!deadline) {
      return null;
    }

    const today = new Date();

    return Math.ceil(
      (new Date(deadline) - today) /
      (1000 * 60 * 60 * 24)
    );

  };

  // ===========================
  // COMPUTED VALUES
  // ===========================

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

  // ===========================
  // MY TASKS - FILTER + SEARCH + SORT
  // ===========================

  let filteredMyTasks =
    acceptedTaskApplications.filter(
      (application) => {
        if (taskFilter === "all") {
          return true;
        }

        return application.taskId?.status === taskFilter;
      }
    );

  // Search my tasks
  if (taskSearchQuery.trim()) {
    const query =
      taskSearchQuery.toLowerCase();

    filteredMyTasks = filteredMyTasks.filter(
      app =>
        app.taskId?.title
          ?.toLowerCase()
          .includes(query) ||
        app.taskId?.category
          ?.toLowerCase()
          .includes(query)
    );
  }

  // Sort my tasks
  filteredMyTasks = [...filteredMyTasks].sort(
    (a, b) => {

      switch (taskSortBy) {
        case "oldest":
          return new Date(a.taskId?.createdAt) -
            new Date(b.taskId?.createdAt);
        case "status":
          return (a.taskId?.status || "").localeCompare(
            b.taskId?.status || ""
          );
        case "completed_first":
          if (a.taskId?.status === "completed" &&
            b.taskId?.status !== "completed") return -1;
          if (b.taskId?.status === "completed" &&
            a.taskId?.status !== "completed") return 1;
          return 0;
        case "newest":
        default:
          return new Date(b.taskId?.createdAt) -
            new Date(a.taskId?.createdAt);
      }

    }
  );

  const activeTaskFilterLabel = {
    all: "All",
    in_progress: "In Progress",
    under_review: "Under Review",
    revision_requested: "Revision Requested",
    completed: "Completed",
  }[taskFilter] || "All";

  // ===========================
  // APPLICATIONS - FILTER + SEARCH
  // ===========================

  let filteredApplications = [...applications];

  if (filter !== "all") {
    filteredApplications = filteredApplications.filter(
      app => app.status === filter
    );
  }

  if (appSearchQuery.trim()) {
    const query =
      appSearchQuery.toLowerCase();

    filteredApplications = filteredApplications.filter(
      app =>
        app.taskId?.title
          ?.toLowerCase()
          .includes(query) ||
        app.taskId?.category
          ?.toLowerCase()
          .includes(query)
    );
  }

  // ===========================
  // PRIORITY TASKS
  // ===========================

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
          getDaysLeft(a.taskId?.currentDeadline);

        const daysB =
          getDaysLeft(b.taskId?.currentDeadline);

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

      {/* =============================== */}
      {/* STATISTICS                       */}
      {/* =============================== */}

      <h2>Statistics</h2>

      <p>
        Applications:
        {totalApplications}
      </p>

      <p>
        Pending:
        {dashboardStats.pendingApplications || pendingApplications}
      </p>

      <p>
        Accepted:
        {acceptedApplications}
      </p>

      <p>
        Completed:
        {dashboardStats.completedTasks || 0}
      </p>

      <p>
        Portfolio Projects:
        {dashboardStats.portfolioProjects || 0}
      </p>

      <p>
        Average Rating:
        {dashboardStats.averageRating || 0}
      </p>

      <p>
        Reviews Received:
        {dashboardStats.reviewCount || 0}
      </p>

      <hr />

      {/* =============================== */}
      {/* RECENT UPDATES                   */}
      {/* =============================== */}

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

      {/* =============================== */}
      {/* PRIORITY TASKS                   */}
      {/* =============================== */}

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
                application.taskId?.currentDeadline
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
                  <strong>Submission Deadline:</strong>{" "}
                  {application.taskId?.currentDeadline
                    ? new Date(
                      application.taskId.currentDeadline
                    ).toLocaleDateString()
                    : "Not Started"}
                </p>

                <p>
                  <strong>Days Left:</strong>{" "}
                  {
                    daysLeft === null
                      ? "Not Started"
                      : daysLeft < 0
                        ? "Overdue"
                        : `${daysLeft} days`
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
      {/* MY TASKS                         */}
      {/* =============================== */}

      <h2>
        My Tasks
      </h2>

      <input
        type="text"
        placeholder="Search my tasks..."
        value={taskSearchQuery}
        onChange={(e) =>
          setTaskSearchQuery(e.target.value)
        }
      />

      <br /><br />

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

      <br /><br />

      <select
        value={taskSortBy}
        onChange={(e) =>
          setTaskSortBy(e.target.value)
        }
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="status">Status</option>
        <option value="completed_first">Completed First</option>
      </select>

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

              const submissionDaysLeft =
  getDaysLeft(
    application.taskId?.currentDeadline
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
                  {taskStatus === "revision_requested"
                    ? "Revision Requested"
                    : taskStatus
                  }
                </p>

                <p>
                  <strong>Submission Deadline:</strong>{" "}
                  {application.taskId?.currentDeadline
                    ? new Date(
                      application.taskId.currentDeadline
                    ).toLocaleDateString()
                    : "Not Started"}
                </p>

                <p>
                  <strong>Days Left:</strong>{" "}
                  {
                    submissionDaysLeft == null
                      ? "Not Started"
                      : submissionDaysLeft < 0
                        ? "Overdue"
                        : `${submissionDaysLeft} days`
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

      <input
        type="text"
        placeholder="Search applications..."
        value={appSearchQuery}
        onChange={(e) =>
          setAppSearchQuery(e.target.value)
        }
      />

      <br /><br />

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

              <p>
                <strong>Application Deadline:</strong>{" "}
                {application.taskId?.applicationDeadline
                  ? new Date(
                    application.taskId.applicationDeadline
                  ).toLocaleDateString()
                  : "N/A"}
              </p>

              <p>
                <strong>Days Left:</strong>{" "}
                {
                  getDaysLeft(application.taskId?.applicationDeadline) == null
                    ? "N/A"
                    : getDaysLeft(application.taskId?.applicationDeadline) < 0
                      ? "Closed"
                      : `${getDaysLeft(application.taskId?.applicationDeadline)} days`
                }
              </p>

              <Link
                to={`/tasks/${application.taskId?._id}`}
              >
                View Details
              </Link>

              {application.status === "pending" && (

                <>
                  {" | "}
                  <button
                    onClick={() =>
                      handleWithdraw(
                        application._id
                      )
                    }
                    disabled={
                      withdrawingId === application._id
                    }
                  >
                    {withdrawingId === application._id
                      ? "Withdrawing..."
                      : "Withdraw"
                    }
                  </button>
                </>

              )}

            </div>

          )
        )

      )}

    </div>
  );
}

export default IndividualDashboard;
