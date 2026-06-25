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

  const handleSubmit =
    async (e) => {

      e.preventDefault();

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

        <button type="submit">
          Submit Work
        </button>

      </form>

      {message && (
        <p>{message}</p>
      )}

    </div>
  );
}

export default SubmitWork;