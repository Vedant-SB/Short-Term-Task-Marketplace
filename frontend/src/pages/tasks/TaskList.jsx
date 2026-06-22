import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function TaskList() {

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchTasks = async () => {

      try {

        const response = await api.get("/tasks");

        setTasks(response.data.tasks);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    fetchTasks();

  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>

      <h1>Available Tasks</h1>

      {tasks.length === 0 ? (
        <p>No Tasks Found</p>
      ) : (
        tasks.map((task) => (
          <div
            key={task._id}
            style={{
              border: "1px solid black",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <h3>{task.title}</h3>

            <p>{task.description}</p>

            <p>
              Budget: ₹{task.budget}
            </p>

            <p>
              Duration: {task.duration}
            </p>

            <Link
              to={`/tasks/${task._id}`}
            >
              View Details
            </Link>

          </div>
        ))
      )}

    </div>
  );
}

export default TaskList;