import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function IndividualDashboard() {

  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filter, setFilter] = useState("all");
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

  const acceptedTasks =
    acceptedTaskApplications.filter(
      app =>
        app.taskId?.status === "in_progress"
    );

  const submittedTasks =
    acceptedTaskApplications.filter(
      app =>
        app.taskId?.status === "under_review"
    );

  const completedTasks =
    acceptedTaskApplications.filter(
      app =>
        app.taskId?.status === "completed"
    );

  const priorityTasks =
    [...acceptedTasks]
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

      {applications
        .slice(0, 5)
        .map(application => (

          <p key={application._id}>

            {application.taskId?.title}
            {" - "}
            {application.status}

          </p>

        ))}

      <hr />

      <h2>
        Priority Tasks
      </h2>

      {priorityTasks.length === 0 ? (

        <p>
          No Priority Tasks
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
                  <Link
                    to={`/tasks/${application.taskId._id}`}
                  >
                    <h3>
                      {
                        application.taskId
                          ?.title
                      }
                    </h3>
                  </Link>
                </h3>

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

                {application.taskId?.status ===
                  "in_progress" && (

                    <Link
                      to={`/tasks/${application.taskId._id}/submit`}
                    >
                      Submit Work
                    </Link>

                  )}

              </div>

            );

          }
        )

      )}

      <hr />

      <h2>
        Accepted Tasks
      </h2>

      {acceptedTasks.length === 0 ? (

        <p>
          No Accepted Tasks
        </p>

      ) : (

        acceptedTasks.map(
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
                Status:
                {
                  application.taskId
                    ?.status
                }
              </p>

              <Link
                to={`/tasks/${application.taskId._id}`}
              >
                View Task
              </Link>

              <br />

              {application.taskId
                ?.status ===
                "in_progress" && (

                  <Link
                    to={`/tasks/${application.taskId._id}/submit`}
                  >
                    Submit Work
                  </Link>

                )}

            </div>

          )
        )

      )}

      <hr />

      <h2>
        Submitted Tasks
      </h2>

      {submittedTasks.length === 0 ? (

        <p>
          No Submitted Tasks
        </p>

      ) : (

        submittedTasks.map(
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
                Status:
                {
                  application.taskId
                    ?.status
                }
              </p>

              <Link
                to={`/tasks/${application.taskId._id}`}
              >
                View Task
              </Link>

              <p>
                Work Submitted
                - Awaiting Review
              </p>

            </div>

          )
        )

      )}

      <hr />

      <h2>
        Completed Tasks
      </h2>

      {completedTasks.length === 0 ? (

        <p>
          No Completed Tasks
        </p>

      ) : (

        completedTasks.map(
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
                Status:
                {
                  application.taskId
                    ?.status
                }
              </p>

              <Link
                to={`/tasks/${application.taskId._id}`}
              >
                View Task
              </Link>

              <p>
                Task Completed
              </p>

            </div>

          )
        )

      )}

      <hr />

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

      {filteredApplications.map(
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

          </div>

        )
      )}

    </div>
  );
}

export default IndividualDashboard;
