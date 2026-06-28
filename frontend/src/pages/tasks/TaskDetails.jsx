import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { ELIGIBLE_LABELS } from "./taskFormConstants";

function TaskDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const [task, setTask] = useState(null);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [hasApplied, setHasApplied] =
    useState(false);

  const [applicationId, setApplicationId] =
    useState(null);

  const [applicationStatus, setApplicationStatus] =
    useState(null);

  const [applicationCount, setApplicationCount] =
    useState(0);

  const [applying, setApplying] =
    useState(false);

  const [withdrawing, setWithdrawing] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [extendingDeadline, setExtendingDeadline] =
    useState(false);

  const [customExtensionDays, setCustomExtensionDays] =
    useState("");

  useEffect(() => {

    const fetchTask = async () => {

      try {

        const response = await api.get(
          `/tasks/${id}`
        );

        setTask(
          response.data.task
        );

        setHasApplied(
          response.data.hasApplied
        );

        setApplicationId(
          response.data.applicationId
        );

        setApplicationStatus(
          response.data.applicationStatus
        );

        setApplicationCount(
          response.data.applicationCount || 0
        );

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    fetchTask();

  }, [id]);

  const handleApply = async () => {

    if (applying) return;

    setApplying(true);
    setMessage("");

    try {

      const response = await api.post(
        "/applications",
        {
          taskId: id
        }
      );

      setMessage(
        response.data.message
      );

      setHasApplied(true);
      setApplicationId(
        response.data.application._id
      );
      setApplicationStatus("pending");

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Failed to apply"
      );

    } finally {

      setApplying(false);

    }

  };

  const handleWithdraw = async () => {

    const confirmed = window.confirm(
      "Withdraw your application?\n\nYou can reapply later if the task is still open."
    );

    if (!confirmed || withdrawing) return;

    setWithdrawing(true);
    setMessage("");

    try {

      const response = await api.put(
        `/applications/${applicationId}/withdraw`
      );

      setMessage(
        response.data.message
      );

      setHasApplied(false);
      setApplicationId(null);
      setApplicationStatus(null);

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Failed to withdraw"
      );

    } finally {

      setWithdrawing(false);

    }

  };

  const handleDelete = async () => {

    const confirmed = window.confirm(
      "Delete this task?\n\nThis action cannot be undone."
    );

    if (!confirmed || deleting) return;

    setDeleting(true);
    setMessage("");

    try {

      await api.delete(
        `/tasks/${id}`
      );

      navigate("/company-dashboard");

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Failed to delete task"
      );

      setDeleting(false);

    }

  };

  const handleExtendDeadline = async (
    days
  ) => {
    if (extendingDeadline) return;

    setExtendingDeadline(true);
    setMessage("");

    try {
      const response = await api.put(
        `/tasks/${id}/extend-deadline`,
        { days }
      );

      setTask(response.data.task);
      setMessage(response.data.message);
      setCustomExtensionDays("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Failed to extend deadline"
      );
    } finally {
      setExtendingDeadline(false);
    }
  };

  // =========================================
  // HELPERS
  // =========================================

  const isOwner =
    user?.role === "company" &&
    task?.postedBy?._id === user?.userId;

  const isSelectedApplicant =
    user?.role === "individual" &&
    task?.selectedApplicant?._id === user?.userId;

  const reviewStatus = task?.reviewStatus || {};

  const companyReviewSubmitted =
    !!reviewStatus.companyReviewSubmitted;

  const individualReviewSubmitted =
    !!reviewStatus.individualReviewSubmitted;

  const canEdit =
    isOwner &&
    task?.status === "open" &&
    applicationCount === 0;

  const canDelete =
    isOwner &&
    task?.status === "open" &&
    applicationCount === 0;

  const canExtendDeadline =
    isOwner &&
    ["in_progress", "under_review", "revision_requested"].includes(
      task?.status
    );

  const getDaysLeft = () => {

    if (!task?.taskDeadline) {
      return null;
    }

    const deadline = new Date(task.taskDeadline);

    const today = new Date();

    return Math.ceil(
      (deadline - today) /
      (1000 * 60 * 60 * 24)
    );

  };

  // =========================================
  // LOADING / NOT FOUND
  // =========================================

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!task) {
    return <h2>Task Not Found</h2>;
  }

  // =========================================
  // RENDER
  // =========================================

  return (

    <div>

      {/* =============================== */}
      {/* TASK INFORMATION (always shown)  */}
      {/* =============================== */}

      <h1>
        {task.title}
      </h1>

      <p>
        Description: {task.description}
      </p>

      {task.postedBy && (
        <p>
          Company: {task.postedBy.companyName}
        </p>
      )}

      <p>
        Budget: ₹{task.budget}
      </p>

      <p>
        Duration: {task.duration} days
      </p>

      <p>
        Application Closing:{" "}
        {task.applicationDeadline
          ? new Date(task.applicationDeadline).toLocaleDateString()
          : "N/A"}
      </p>

      <p>
        Task Start Date:{" "}
        {task.taskStartDate
          ? new Date(task.taskStartDate).toLocaleDateString()
          : "Not started"}
      </p>

      <p>
        Task Deadline:{" "}
        {task.taskDeadline
          ? new Date(task.taskDeadline).toLocaleDateString()
          : "Not started"}
      </p>

      {task.taskDeadline && (
        <p>
          Days Left: {(() => {
            const daysLeft = getDaysLeft();
            if (daysLeft === null) return "N/A";
            if (daysLeft < 0) return "Overdue";
            return `${daysLeft} days left`;
          })()}
        </p>
      )}

      <p>
        Category: {task.category}
      </p>

      {task.skillsRequired &&
        task.skillsRequired.length > 0 && (
        <p>
          Skills: {task.skillsRequired.join(", ")}
        </p>
      )}

      <p>
        Deliverables: {task.deliverables}
      </p>

      {task.eligibleFor &&
        task.eligibleFor.length > 0 && (
        <p>
          Eligible For:{" "}
          {task.eligibleFor
            .map((e) => ELIGIBLE_LABELS[e] || e)
            .join(", ")}
        </p>
      )}

      <p>
        Status: {task.status === "revision_requested"
          ? "Revision Requested"
          : task.status}
      </p>

      <hr />

      {/* =============================== */}
      {/* MESSAGE                          */}
      {/* =============================== */}

      {message && (
        <p>{message}</p>
      )}

      {task.deadlineExtensions &&
        task.deadlineExtensions.length > 0 && (
        <p>
          Deadline Extensions: {task.deadlineExtensions.length}
        </p>
      )}

      {/* =============================== */}
      {/* INDIVIDUAL USER                  */}
      {/* =============================== */}

      {user?.role === "individual" && (

        <>

          {/* --- OPEN --- */}

          {task.status === "open" &&
            !hasApplied && (

            <button
              onClick={handleApply}
              disabled={applying}
            >
              {applying
                ? "Applying..."
                : "Apply To Task"
              }
            </button>

          )}

          {task.status === "open" &&
            hasApplied &&
            applicationStatus === "pending" && (

            <>
              <p>
                <strong>Already Applied</strong>
              </p>

              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
              >
                {withdrawing
                  ? "Withdrawing..."
                  : "Withdraw Application"
                }
              </button>
            </>

          )}

          {task.status === "open" &&
            hasApplied &&
            applicationStatus !== "pending" && (

            <p>
              <strong>Already Applied</strong>
            </p>

          )}

          {/* --- IN PROGRESS --- */}

          {task.status === "in_progress" &&
            isSelectedApplicant && (

            <>

              <h3>
                Assigned To You
              </h3>

              <p>
                Deadline:{" "}
                {(() => {
                  const daysLeft = getDaysLeft();
                  if (daysLeft === null) return "N/A";
                  if (daysLeft < 0) return "Overdue";
                  return `${daysLeft} days left`;
                })()}
              </p>

              <br />

              <Link
                to={`/tasks/${task._id}/submit`}
              >
                Submit Work
              </Link>

            </>

          )}

          {task.status === "in_progress" &&
            !isSelectedApplicant && (

            <p>
              Task In Progress
            </p>

          )}

          {/* --- UNDER REVIEW --- */}

          {task.status === "under_review" && (

            <>

              <h3>
                Work Submitted
              </h3>

              <p>
                Awaiting Company Review
              </p>

            </>

          )}

          {/* --- REVISION REQUESTED --- */}

          {task.status === "revision_requested" &&
            isSelectedApplicant && (

            <>

              <h3>
                Revision Requested
              </h3>

              <p>
                <strong>Reason:</strong>{" "}
                {task.revisionReason}
              </p>

              <p>
                <strong>Expected Changes:</strong>{" "}
                {task.revisionExpectedChanges}
              </p>

              <br />

              <Link
                to={`/tasks/${task._id}/submit`}
              >
                Resubmit Work
              </Link>

            </>

          )}

          {task.status === "revision_requested" &&
            !isSelectedApplicant && (

            <p>
              Revision Requested
            </p>

          )}

          {/* --- COMPLETED --- */}

          {task.status === "completed" && (

            <h3>
              Task Completed
            </h3>

          )}

          {task.status === "completed" &&
            isSelectedApplicant && (

            <>

              {companyReviewSubmitted ? (

                <p>
                  Company Review Submitted
                </p>

              ) : (

                <p>
                  Waiting for Company Review
                </p>

              )}

              {companyReviewSubmitted &&
                !individualReviewSubmitted && (

                <>
                  <p>
                    Pending Review
                  </p>

                  <Link
                    to={`/tasks/${task._id}/review`}
                  >
                    Review Company
                  </Link>
                </>

              )}

              {individualReviewSubmitted && (

                <p>
                  Individual Review Submitted
                </p>

              )}

            </>

          )}

        </>

      )}

      {/* =============================== */}
      {/* COMPANY USER                     */}
      {/* =============================== */}

      {user?.role === "company" && isOwner && (

        <>

          {/* --- EDIT / DELETE --- */}

          {canEdit && (
            <Link
              to={`/tasks/${task._id}/edit`}
            >
              Edit Task
            </Link>
          )}

          {canDelete && (
            <>
              {" | "}
              <button
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Task"
                }
              </button>
            </>
          )}

          {(canEdit || canDelete) && <hr />}

          {canExtendDeadline && (
            <>
              <h3>Extend Deadline</h3>

              <button
                onClick={() => handleExtendDeadline(1)}
                disabled={extendingDeadline}
              >
                +1 day
              </button>

              {" "}

              <button
                onClick={() => handleExtendDeadline(2)}
                disabled={extendingDeadline}
              >
                +2 days
              </button>

              {" "}

              <button
                onClick={() => handleExtendDeadline(3)}
                disabled={extendingDeadline}
              >
                +3 days
              </button>

              {" "}

              <input
                type="number"
                min="1"
                placeholder="Custom days"
                value={customExtensionDays}
                onChange={(e) =>
                  setCustomExtensionDays(e.target.value)
                }
                disabled={extendingDeadline}
              />

              {" "}

              <button
                onClick={() =>
                  handleExtendDeadline(Number(customExtensionDays))
                }
                disabled={
                  extendingDeadline ||
                  !customExtensionDays ||
                  Number(customExtensionDays) < 1
                }
              >
                Extend
              </button>
              <hr />
            </>
          )}

          {/* --- OPEN --- */}

          {task.status === "open" && (

            <Link
              to={`/task-applicants/${task._id}`}
            >
              View Applicants
            </Link>

          )}

          {/* --- IN PROGRESS --- */}

          {task.status === "in_progress" &&
            task.selectedApplicant && (

            <>

              <h3>
                Selected Applicant
              </h3>

              <p>
                Name: {task.selectedApplicant.name}
              </p>

              <p>
                Email: {task.selectedApplicant.email}
              </p>

              <p>
                Type: {ELIGIBLE_LABELS[task.selectedApplicant.individualType] || task.selectedApplicant.individualType}
              </p>

              <br />

              <p>
                Task currently in progress.
              </p>

            </>

          )}

          {/* --- UNDER REVIEW --- */}

          {task.status === "under_review" && (

            <>

              <h3>
                Submission Summary
              </h3>

              {task.selectedApplicant && (

                <p>
                  Applicant: {task.selectedApplicant.name}
                </p>

              )}

              <p>
                Submission Link:{" "}
                <a
                  href={task.submissionLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  {task.submissionLink}
                </a>
              </p>

              <p>
                Submission Note: {task.submissionNote}
              </p>

              <p>
                Submitted At:{" "}
                {new Date(
                  task.submittedAt
                ).toLocaleString()}
              </p>

              <br />

              <Link
                to={`/tasks/${task._id}/review`}
              >
                Review Submission
              </Link>

            </>

          )}

          {/* --- REVISION REQUESTED --- */}

          {task.status === "revision_requested" && (

            <>

              <h3>
                Revision Requested
              </h3>

              <p>
                <strong>Reason:</strong>{" "}
                {task.revisionReason}
              </p>

              <p>
                <strong>Expected Changes:</strong>{" "}
                {task.revisionExpectedChanges}
              </p>

              <br />

              <p>
                Waiting for resubmission.
              </p>

            </>

          )}

          {/* --- COMPLETED --- */}

          {task.status === "completed" && (

            <>

              <h3>
                Task Completed
              </h3>

              {task.selectedApplicant && (

                <p>
                  Completed By: {task.selectedApplicant.name}
                </p>

              )}

              {task.submissionLink && (

                <p>
                  Submission Link:{" "}
                  <a
                    href={task.submissionLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {task.submissionLink}
                  </a>
                </p>

              )}

              {task.submissionNote && (

                <p>
                  Submission Note: {task.submissionNote}
                </p>

              )}

              {task.submittedAt && (

                <p>
                  Submitted At:{" "}
                  {new Date(
                    task.submittedAt
                  ).toLocaleString()}
                </p>

              )}

              {companyReviewSubmitted ? (

                <p>
                  Company Review Submitted
                </p>

              ) : (

                <>
                  <p>
                    Pending Review
                  </p>

                  <Link
                    to={`/tasks/${task._id}/review`}
                  >
                    Leave Review
                  </Link>
                </>

              )}

              {individualReviewSubmitted && (

                <p>
                  Individual Review Submitted
                </p>

              )}

            </>

          )}

        </>

      )}

    </div>

  );

}

export default TaskDetails;