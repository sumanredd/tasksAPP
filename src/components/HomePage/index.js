import { useEffect, useState } from "react";
import { withRouter } from "../withRouter";
import CircularProgress from '@mui/material/CircularProgress';

import "./index.css";

const Home = (props) => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resUser = await fetch("http://localhost:4000/me", {
          credentials: "include",
        });

        if (resUser.ok) {
          const dataUser = await resUser.json();
          setUser(dataUser.user);

          const resTasks = await fetch("http://localhost:4000/tasks", {
            credentials: "include",
          });
          if (resTasks.ok) {
            const dataTasks = await resTasks.json();
            setTasks(dataTasks.tasks);
          }
        } else {
          props.navigate("/login", { replace: true });
          return;
        }
      } catch (err) {
        console.error(err);
        props.navigate("/login", { replace: true });
      } finally {
      
        setTimeout(() => setLoading(false), 1500);
      }
    };

    fetchData();
  }, [props]);

  const addTask = async () => {
    if (!newTask) return;
    try {
      const res = await fetch("http://localhost:4000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newTask }),
      });
      const data = await res.json();
      if (res.ok) {
        setTasks((prev) => [data.task, ...prev]);
        setNewTask("");
        setSuccessMsg(`Task '${data.task.title}' added successfully!`);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/tasks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        setSuccessMsg("Task deleted successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const editTask = async (task) => {
    const taskTitle = prompt("Edit Task:", task.title);
    if (!taskTitle) return;

    try {
      const res = await fetch(`http://localhost:4000/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: taskTitle }),
      });
      const data = await res.json();
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, title: data.task.title, editedByAdmin: data.task.editedByAdmin }
              : t
          )
        );
        setSuccessMsg("Task updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:4000/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setUser(null);
        props.navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error(err);
    }
  };


  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress color="secondary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="HomeContainer">
      <div className="DashboardCard">
        
        <div className="DashboardHeader">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 className="DashboardHeading">Welcome, {user.username} 👋</h1>
            {user.role === "ADMIN" && <span className="AdminBadge">ADMIN</span>}
          </div>
          <button onClick={handleLogout} className="LogoutButton">
            Logout
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", height: "40px" }}>
          <p className={`SuccessMsg ${successMsg ? "show" : ""}`}>{successMsg}</p>
        </div>

        <div className="TaskSection">
          <h2 className="TaskHeading">All Tasks</h2>

          <div className="AddTask">
            <input
              type="text"
              placeholder="Add new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="TaskInput"
              autoComplete="off"
            />
            <button onClick={addTask} className="AddButton">
              Add Task
            </button>
          </div>

          <ul className="TaskList">
            {tasks.map((task) => (
              <li key={task.id} className="TaskItem">
                <div>
                  <span className="taskTitle">{task.title}</span>
                  {task.user && (
                    <small className="TaskAuthor"> — by {task.user.username}</small>
                  )}
                  {task.editedByAdmin && <small className="EditedAdmin"> (Edited by Admin)</small>}
                </div>

                {(task.user?.id === user.id || user.role === "ADMIN") && (
                  <div className="TaskActions">
                    <button onClick={() => editTask(task)} className="EditButton">
                      Edit
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="DeleteButton">
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default withRouter(Home);
