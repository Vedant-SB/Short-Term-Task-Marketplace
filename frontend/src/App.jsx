import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import SubmitWork from "./pages/tasks/SubmitWork";
import TaskList from "./pages/tasks/TaskList";
import CreateTask from "./pages/tasks/CreateTask";
import TaskDetails from "./pages/tasks/TaskDetails";

import CompanyDashboard from "./pages/dashboard/CompanyDashboard";
import IndividualDashboard from "./pages/dashboard/IndividualDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

import MyApplications from "./pages/applications/MyApplications";
import TaskApplicants from "./pages/applications/TaskApplicants";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Navbar />

        <Routes>

          <Route
            path="/"
            element={<Navigate to="/tasks" />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/tasks"
            element={<TaskList />}
          />

          <Route
            path="/tasks/:id"
            element={<TaskDetails />}
          />

          <Route
            path="/tasks/:id/submit"
            element={
              <ProtectedRoute
                allowedRoles={["individual"]}
              >
                <SubmitWork />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks/create"
            element={
              <ProtectedRoute
                allowedRoles={["company"]}
              >
                <CreateTask />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["company"]}
              >
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/individual-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["individual"]}
              >
                <IndividualDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-applications"
            element={
              <ProtectedRoute
                allowedRoles={["individual"]}
              >
                <MyApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/task-applicants/:taskId"
            element={
              <ProtectedRoute
                allowedRoles={["company"]}
              >
                <TaskApplicants />
              </ProtectedRoute>
            }
          />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;