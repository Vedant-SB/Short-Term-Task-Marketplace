import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

function SubmitWork() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [submissionLink,
    setSubmissionLink] =
    useState("");

  const [submissionNote,
    setSubmissionNote] =
    useState("");

  const [message,
    setMessage] =
    useState("");

  const [submitting,
    setSubmitting] =
    useState(false);

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      const confirmed = window.confirm(
        "Are you sure you want to submit your work?\n\nAfter submission your work will be sent to the company for review."
      );

      if (!confirmed) {
        return;
      }

      if (submitting) return;

      setSubmitting(true);
      setMessage("");

      try {

        const response =
          await api.put(
            `/tasks/${id}/submit`,
            {
              submissionLink,
              submissionNote
            }
          );

        setMessage(
          response.data.message
        );

        setTimeout(() => {

          navigate(
            "/individual-dashboard"
          );

        }, 1500);

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Submission failed"
        );

      } finally {

        setSubmitting(false);

      }

    };

  return (
    <div>

      <h1>
        Submit Work
      </h1>

      <form
        onSubmit={handleSubmit}
      >

        <div>

          <label>
            Submission Link
          </label>

          <br />

          <input
            type="text"
            value={submissionLink}
            onChange={(e) =>
              setSubmissionLink(
                e.target.value
              )
            }
            placeholder="Github, Drive, Figma, etc."
            required
          />

        </div>

        <br />

        <div>

          <label>
            Submission Note
          </label>

          <br />

          <textarea
            value={submissionNote}
            onChange={(e) =>
              setSubmissionNote(
                e.target.value
              )
            }
            rows="5"
            cols="40"
            required
          />

        </div>

        <br />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Submitting..."
            : "Submit Work"
          }
        </button>

      </form>

      {message && (
        <p>{message}</p>
      )}

    </div>
  );
}

export default SubmitWork;