import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

function TaskApplicants() {

  const { taskId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
        <p>No Applicants Yet</p>
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
                Type:
                {
                  application
                    .applicantId
                    ?.individualType
                }
              </p>

              <p>
                Skills:
                {
                  application
                    .applicantId
                    ?.skills?.join(", ")
                }
              </p>

              <p>
                Status:
                {
                  application.status
                }
              </p>

              {application.status === "pending" && (

                <button
                  onClick={() =>
                    handleAccept(
                      application._id
                    )
                  }
                >
                  Accept Applicant
                </button>

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