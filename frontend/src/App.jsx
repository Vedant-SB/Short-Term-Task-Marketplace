import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import SubmitWork from "./pages/tasks/SubmitWork";
import TaskList from "./pages/tasks/TaskList";
import CreateTask from "./pages/tasks/CreateTask";
import TaskDetails from "./pages/tasks/TaskDetails";
import ReviewSubmission from "./pages/tasks/ReviewSubmission";
import EditTask from "./pages/tasks/EditTask";

import LandingPage from "./pages/LandingPage";

import CompanyDashboard from "./pages/dashboard/CompanyDashboard";
import IndividualDashboard from "./pages/dashboard/IndividualDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

import TaskApplicants from "./pages/applications/TaskApplicants";
import CompanyApplicants from "./pages/applications/CompanyApplicants";
import MyApplications from "./pages/applications/MyApplications";
import AssignedTasks from "./pages/tasks/AssignedTasks";
import Profile from "./pages/profile/Profile";
import ApplicantPortfolio from "./pages/profile/ApplicantPortfolio";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          {/* ── Public marketing website ─────────────────── */}
          {/* Landing page renders its own Nav.jsx — no AppLayout */}
          <Route
            path="/"
            element={<LandingPage />}
          />

          {/* ── Authentication routes (clean layout, no Navbar) ─── */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={<Login />}
            />
            <Route
              path="/register"
              element={<Register />}
            />
          </Route>

          {/* ── Application routes (with authenticated Navbar) */}
          <Route element={<AppLayout />}>

            <Route
              path="/tasks"
              element={<TaskList />}
            />

            <Route
              path="/tasks/:id"
              element={<TaskDetails />}
            />

            <Route
              path="/tasks/:id/edit"
              element={
                <ProtectedRoute
                  allowedRoles={["company"]}
                >
                  <EditTask />
                </ProtectedRoute>
              }
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
              path="/company-applicants"
              element={
                <ProtectedRoute
                  allowedRoles={["company"]}
                >
                  <CompanyApplicants />
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

            <Route
              path="/tasks/:id/review"
              element={
                <ProtectedRoute
                  allowedRoles={["company", "individual"]}
                >
                  <ReviewSubmission />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <ApplicantPortfolio />
                </ProtectedRoute>
              }
            />

            <Route
              path="/portfolio/:userId"
              element={
                <ProtectedRoute>
                  <ApplicantPortfolio />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-assigned-tasks"
              element={
                <ProtectedRoute allowedRoles={["individual"]}>
                  <AssignedTasks />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-applications"
              element={
                <ProtectedRoute allowedRoles={["individual"]}>
                  <MyApplications />
                </ProtectedRoute>
              }
            />

          </Route>

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;