import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

function TaskApplicants() {

  const { taskId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchApplicants = async () => {

    try {

      const response =
        await api.get(
          `/applications/task/${taskId}`
        );

      setApplications(
        response.data.applications
      );

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchApplicants();

  }, [taskId]);

  const handleAccept = async (
    applicationId
  ) => {

    const confirmed = window.confirm(
      "Accept this applicant?\n\nYou won't be able to select another applicant later."
    );

    if (!confirmed) return;

    if (acceptingId) return;

    setAcceptingId(applicationId);
    setMessage("");

    try {

      const response =
        await api.put(
          `/applications/${applicationId}/accept`
        );

      setMessage(
        response.data.message
      );

      fetchApplicants();

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Failed to accept applicant"
      );

    } finally {

      setAcceptingId(null);

    }

  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>

      <h1>Applicants</h1>

      {message && (
        <p>{message}</p>
      )}

      {applications.length === 0 ? (
        <p>No applicants have applied yet.</p>
      ) : (

        applications.map(
          (application) => (

            <div
              key={application._id}
              style={{
                border:
                  "1px solid black",
                marginBottom: "10px",
                padding: "10px",
              }}
            >

              <h3>
                {
                  application
                    .applicantId
                    ?.name
                }
              </h3>

              <p>
                Type:{" "}
                {
                  application
                    .applicantId
                    ?.individualType
                }
              </p>

              <p>
                Skills:{" "}
                {
                  application
                    .applicantId
                    ?.skills?.join(", ")
                }
              </p>

              <p>
                Average Rating:{" "}
                {
                  application
                    .applicantId
                    ?.averageRating || 0
                }
              </p>

              <p>
                Total Reviews:{" "}
                {
                  application
                    .applicantId
                    ?.totalReviews || 0
                }
              </p>

              <p>
                Completed Projects:{" "}
                {
                  application
                    .applicantId
                    ?.completedProjects || 0
                }
              </p>

              <p>
                Status:{" "}
                {
                  application.status
                }
              </p>

              <Link
                to={`/profile/${application.applicantId?._id}`}
              >
                View Profile
              </Link>

              {application.status === "pending" && (

                <>
                  {" | "}
                  <button
                    onClick={() =>
                      handleAccept(
                        application._id
                      )
                    }
                    disabled={acceptingId === application._id}
                  >
                    {acceptingId === application._id
                      ? "Accepting..."
                      : "Accept Applicant"
                    }
                  </button>
                </>

              )}

              {application.status === "accepted" && (

                <p>
                  Selected Applicant
                </p>

              )}

              {application.status === "rejected" && (

                <p>
                  Application Rejected
                </p>

              )}

            </div>

          )
        )

      )}

    </div>
  );
}

export default TaskApplicants;