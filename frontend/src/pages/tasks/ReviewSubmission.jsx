import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function ReviewSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [completing, setCompleting] = useState(false);
  const [requestingChanges, setRequestingChanges] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");
  const [revisionExpectedChanges, setRevisionExpectedChanges] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const reviewStatus = task?.reviewStatus || {};
  const companyReviewSubmitted = !!reviewStatus.companyReviewSubmitted;
  const individualReviewSubmitted = !!reviewStatus.individualReviewSubmitted;

  const isOwner =
    user?.role === "company" &&
    task?.postedBy?._id === user?.userId;

  const isSelectedApplicant =
    user?.role === "individual" &&
    task?.selectedApplicant?._id === user?.userId;

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}`);
        setTask(response.data.task);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleComplete = async () => {
    const confirmed = window.confirm(
      "Mark this task as completed?\n\nThis action cannot be undone."
    );

    if (!confirmed || completing) {
      return;
    }

    setCompleting(true);
    setMessage("");

    try {
      const response = await api.put(`/tasks/${id}/complete`);
      setMessage(response.data.message);
      setTask({
        ...task,
        status: "completed",
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to complete task"
      );
    } finally {
      setCompleting(false);
    }
  };

  const handleRequestChanges = async (e) => {
    e.preventDefault();

    const confirmed = window.confirm(
      "Request changes on this submission?\n\nThe applicant will need to resubmit their work."
    );

    if (!confirmed || requestingChanges) {
      return;
    }

    setRequestingChanges(true);
    setMessage("");

    try {
      const response = await api.put(
        `/tasks/${id}/request-changes`,
        {
          reason: revisionReason,
          expectedChanges: revisionExpectedChanges,
        }
      );

      setMessage(response.data.message);
      setTask({
        ...task,
        status: "revision_requested",
        revisionReason,
        revisionExpectedChanges,
      });
      setShowRevisionForm(false);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to request changes"
      );
    } finally {
      setRequestingChanges(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (submittingReview) {
      return;
    }

    setSubmittingReview(true);
    setMessage("");

    try {
      const response = await api.post(
        `/reviews/${id}`,
        {
          rating: reviewRating,
          comment: reviewComment,
        }
      );

      setMessage(response.data.message);

      setTask({
        ...task,
        reviewStatus: {
          ...reviewStatus,
          companyReviewSubmitted:
            user?.role === "company" ? true : companyReviewSubmitted,
          individualReviewSubmitted:
            user?.role === "individual" ? true : individualReviewSubmitted,
        },
      });

      setTimeout(() => {
        if (user?.role === "company") {
          navigate("/company-dashboard");
        } else {
          navigate("/individual-dashboard");
        }
      }, 1500);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to submit review"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!task) {
    return <h2>Task Not Found</h2>;
  }

  const canCompanyReview =
    user?.role === "company" &&
    isOwner &&
    task.status === "completed" &&
    !companyReviewSubmitted;

  const canIndividualReview =
    user?.role === "individual" &&
    isSelectedApplicant &&
    task.status === "completed" &&
    companyReviewSubmitted &&
    !individualReviewSubmitted;

  const showReviewForm =
    canCompanyReview || canIndividualReview;

  return (
    <div>
      <h1>Review Submission</h1>

      <hr />

      <h2>{task.title}</h2>

      <p>
        Applicant: {task.selectedApplicant?.name}
      </p>

      <p>
        Type: {task.selectedApplicant?.individualType}
      </p>

      <hr />

      <p>Submission Link:</p>

      <a
        href={task.submissionLink}
        target="_blank"
        rel="noreferrer"
      >
        {task.submissionLink}
      </a>

      <br />
      <br />

      <p>Submission Note:</p>
      <p>{task.submissionNote}</p>

      <br />

      <p>
        Submitted At:{" "}
        {task.submittedAt
          ? new Date(task.submittedAt).toLocaleString()
          : "N/A"}
      </p>

      <br />

      {message && <p>{message}</p>}

      {user?.role === "company" &&
        isOwner &&
        task.status === "under_review" && (
        <>
          <button
            onClick={handleComplete}
            disabled={completing}
          >
            {completing
              ? "Completing..."
              : "Mark as Complete"}
          </button>

          {" "}

          <button
            onClick={() =>
              setShowRevisionForm(!showRevisionForm)
            }
          >
            Request Changes
          </button>

          {showRevisionForm && (
            <form
              onSubmit={handleRequestChanges}
              style={{
                marginTop: "15px",
                padding: "10px",
                border: "1px solid black"
              }}
            >
              <h3>Request Changes</h3>

              <div>
                <label>Reason</label>
                <br />
                <textarea
                  value={revisionReason}
                  onChange={(e) =>
                    setRevisionReason(e.target.value)
                  }
                  rows="3"
                  cols="40"
                  placeholder="Why are changes needed?"
                  required
                />
              </div>

              <br />

              <div>
                <label>Expected Changes</label>
                <br />
                <textarea
                  value={revisionExpectedChanges}
                  onChange={(e) =>
                    setRevisionExpectedChanges(
                      e.target.value
                    )
                  }
                  rows="3"
                  cols="40"
                  placeholder="What changes are expected?"
                  required
                />
              </div>

              <br />

              <button
                type="submit"
                disabled={requestingChanges}
              >
                {requestingChanges
                  ? "Requesting Changes..."
                  : "Submit Revision Request"}
              </button>

              {" "}

              <button
                type="button"
                onClick={() => setShowRevisionForm(false)}
              >
                Cancel
              </button>
            </form>
          )}
        </>
      )}

      {task.status === "revision_requested" &&
        isSelectedApplicant && (
        <>
          <h3>Revision Requested</h3>

          <p>
            <strong>Reason:</strong>{" "}
            {task.revisionReason}
          </p>

          <p>
            <strong>Expected Changes:</strong>{" "}
            {task.revisionExpectedChanges}
          </p>

          <p>Waiting for resubmission.</p>
        </>
      )}

      {task.status === "completed" && (
        <>
          <h3>Task Completed</h3>

          {user?.role === "company" && (
            companyReviewSubmitted ? (
              <p>Company Review Submitted</p>
            ) : (
              <p>Pending Review</p>
            )
          )}

          {user?.role === "individual" && (
            <>
              {companyReviewSubmitted ? (
                <p>Company Review Submitted</p>
              ) : (
                <p>Waiting for Company Review</p>
              )}

              {companyReviewSubmitted &&
                !individualReviewSubmitted && (
                <p>Pending Review</p>
              )}

              {individualReviewSubmitted && (
                <p>Individual Review Submitted</p>
              )}
            </>
          )}

          {showReviewForm && (
            <form
              onSubmit={handleReviewSubmit}
              style={{
                marginTop: "15px",
                padding: "10px",
                border: "1px solid black"
              }}
            >
              <h3>
                {user?.role === "company"
                  ? "Review Individual"
                  : "Review Company"}
              </h3>

              <div>
                <label>Rating</label>
                <br />
                <select
                  value={reviewRating}
                  onChange={(e) =>
                    setReviewRating(Number(e.target.value))
                  }
                  required
                >
                  <option value={5}>5</option>
                  <option value={4}>4</option>
                  <option value={3}>3</option>
                  <option value={2}>2</option>
                  <option value={1}>1</option>
                </select>
              </div>

              <br />

              <div>
                <label>Comment</label>
                <br />
                <textarea
                  value={reviewComment}
                  onChange={(e) =>
                    setReviewComment(e.target.value)
                  }
                  rows="4"
                  cols="45"
                  required
                />
              </div>

              <br />

              <button
                type="submit"
                disabled={submittingReview}
              >
                {submittingReview
                  ? "Submitting..."
                  : "Submit Review"}
              </button>
            </form>
          )}

        </>
      )}
    </div>
  );
}

export default ReviewSubmission;
