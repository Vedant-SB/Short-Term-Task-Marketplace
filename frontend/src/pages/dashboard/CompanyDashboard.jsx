import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function CompanyDashboard() {

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchTasks = async () => {

      try {

        const response = await api.get(
          "/tasks/my-tasks"
        );

        setTasks(response.data.tasks);
        setFilteredTasks(response.data.tasks);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    fetchTasks();

  }, []);

  useEffect(() => {

    if (filter === "all") {
      setFilteredTasks(tasks);
    } else {

      const filtered = tasks.filter(
        task => task.status === filter
      );

      setFilteredTasks(filtered);

    }

  }, [filter, tasks]);

  const getDaysLeft = (task) => {

    const createdDate = new Date(
      task.createdAt
    );

    const deadline = new Date(
      createdDate
    );

    deadline.setDate(
      deadline.getDate() + task.duration
    );

    const today = new Date();

    const diffTime =
      deadline - today;

    const diffDays = Math.ceil(
      diffTime / (1000 * 60 * 60 * 24)
    );

    return diffDays;

  };

  const totalTasks = tasks.length;

  const openTasks =
    tasks.filter(
      task => task.status === "open"
    ).length;

  const inProgressTasks =
    tasks.filter(
      task => task.status === "in_progress"
    ).length;

  const completedTasks =
    tasks.filter(
      task => task.status === "completed"
    ).length;

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>

      <h1>
        Company Dashboard
      </h1>

      <h3>
        Total Tasks: {totalTasks}
      </h3>

      <h3>
        Open: {openTasks}
      </h3>

      <h3>
        In Progress:
        {inProgressTasks}
      </h3>

      <h3>
        Completed:
        {completedTasks}
      </h3>

      <hr />

      <h2>
        Filter Tasks
      </h2>

      <button
        onClick={() => setFilter("all")}
      >
        All
      </button>

      <button
        onClick={() => setFilter("open")}
      >
        Open
      </button>

      <button
        onClick={() =>
          setFilter("in_progress")
        }
      >
        In Progress
      </button>

      <button
        onClick={() =>
          setFilter("under_review")
        }
      >
        Under Review
      </button>

      <button
        onClick={() =>
          setFilter("completed")
        }
      >
        Completed
      </button>

      <hr />

      {filteredTasks.length === 0 ? (
        <p>No Tasks Found</p>
      ) : (

        filteredTasks.map(
          (task) => {

            const daysLeft =
              getDaysLeft(task);

            return (

              <div
                key={task._id}
                style={{
                  border:
                    "1px solid black",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >

                <Link
                  to={`/tasks/${task._id}`}
                >
                  <h3>
                    {task.title}
                  </h3>
                </Link>

                <p>
                  Status:
                  {task.status}
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
                  Deadline:
                  {
                    daysLeft < 0
                      ? " Overdue"
                      : `${daysLeft} days left`
                  }
                </p>

                <Link
                  to={`/task-applicants/${task._id}`}
                >
                  View Applicants
                </Link>

              </div>

            );

          }
        )

      )}

    </div>
  );
}

export default CompanyDashboard;