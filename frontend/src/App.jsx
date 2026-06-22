import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import TaskList from "./pages/tasks/TaskList";
import CreateTask from "./pages/tasks/CreateTask";
import TaskDetails from "./pages/tasks/TaskDetails";

import CompanyDashboard from "./pages/dashboard/CompanyDashboard";
import IndividualDashboard from "./pages/dashboard/IndividualDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

import MyApplications from "./pages/applications/MyApplications";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/tasks" element={<TaskList />} />

          <Route
            path="/tasks/create"
            element={
              <ProtectedRoute>
                <CreateTask />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks/:id"
            element={<TaskDetails />}
          />

          <Route
            path="/company-dashboard"
            element={
              <ProtectedRoute>
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/individual-dashboard"
            element={
              <ProtectedRoute>
                <IndividualDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-applications"
            element={
              <ProtectedRoute>
                <MyApplications />
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;