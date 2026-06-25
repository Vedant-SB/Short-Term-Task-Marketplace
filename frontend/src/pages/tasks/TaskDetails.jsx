import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function TaskDetails() {

  const { id } = useParams();

  const { user } = useAuth();

  const [task, setTask] = useState(null);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [hasApplied, setHasApplied] =
    useState(false);

  useEffect(() => {

    const fetchTask = async () => {

      try {

        const response = await api.get(
          `/tasks/${id}`
        );

        console.log(
          response.data.task
        );

        setTask(
          response.data.task
        );

        setHasApplied(
          response.data.hasApplied
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

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Failed to apply"
      );

    }

  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!task) {
    return <h2>Task Not Found</h2>;
  }

  return (

    <div>

      <h1>
        {task.title}
      </h1>

      <p>
        Description:
        {task.description}
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
        Status:
        {task.status}
      </p>

      <p>
        Category:
        {task.category}
      </p>

      {task.postedBy && (

        <p>
          Company:
          {
            task.postedBy
              .companyName
          }
        </p>

      )}

      {message && (
        <p>{message}</p>
      )}

      {user?.role === "individual" &&
        task.status === "open" &&
        !hasApplied && (

          <button
            onClick={handleApply}
          >
            Apply To Task
          </button>

        )}

      {user?.role === "individual" &&
        hasApplied && (

          <p>
            Already Applied
          </p>

        )}

      {task.status === "in_progress" && (

        <p>
          Task In Progress
        </p>

      )}

      {task.status ===
        "under_review" && (

          <p>
            Work Submitted -
            Awaiting Review
          </p>

        )}

      {task.status ===
        "completed" && (

          <p>
            Task Completed
          </p>

        )}

      {user?.role === "individual" &&
        task.status ===
        "in_progress" &&
        task.selectedApplicant ===
        user.userId && (

          <Link
            to={`/tasks/${task._id}/submit`}
          >
            Submit Work
          </Link>

        )}

    </div>

  );

}

export default TaskDetails;