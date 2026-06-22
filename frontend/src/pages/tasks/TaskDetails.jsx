import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function TaskDetails() {

  const { id } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState("");

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchTask = async () => {

      try {

        const response = await api.get(
          `/tasks/${id}`
        );

        console.log(response.data);

        setTask(response.data.task);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    fetchTask();

  }, [id]);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!task) {
    return <h2>Task Not Found</h2>;
  }

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

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Failed to apply"
      );

    }

  };

  return (
    <div>

      <h1>{task.title}</h1>

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
        {task.duration}
      </p>

      <p>
        Status:
        {task.status}
      </p>

      <p>
        Category:
        {task.category}
      </p>

      {message && (
        <p>{message}</p>
      )}

      {user?.role === "individual" && (
        <button onClick={handleApply}>
          Apply To Task
        </button>
      )}

    </div>
  );
}

export default TaskDetails;