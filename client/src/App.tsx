import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WithPermission } from "@/components/common/WithPermission";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { BaseLayout } from "./layouts/BaseLayout";
import NotFoundPage from "./pages/NotFoundPage";
import Login from "./pages/auth/Login";
import Feed from "./pages/common/Feed";
import { HRDashboard } from "./pages/HR/HRDashboard";
import { AllDepartments } from "./pages/HR/Employees/AllDepartments";
import EventsCalendar from "./pages/Employee/EventsCalendar";
import Departments from "./pages/Employee/Departments";
import DepartmentDetails from "./pages/Employee/DepartmentDetails";
import TimeOff from "./pages/Employee/TimeOff";
import EmployeeTimeOff from "./pages/HR/Employees/EmployeeTimeOff";
import RecruitmentPage from "./pages/HR/Recruitment/Recruitment";
import { RecruitmentType } from "./lib/enums";
import CandidateDetailView from "./pages/HR/Recruitment/CandidateDetailed";
import { ManageEmployees } from "./pages/HR/Employees/ManageEmployees";
import CreatePassword from "./pages/auth/CreatePassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Events from "./pages/HR/Events/Events";
import DepartmentPage from "@/pages/HR/Employees/DepartmentPage";
import Messages from "./pages/common/Messages";
import FindEmployee from "./pages/common/FindEmployee";
import EmployeePage from "@/pages/HR/Employees/EmployeePage";
import EmployeeTimeOffRequests from "./pages/Manager/EmployeeTimeOffRequests";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/set-password" element={<CreatePassword />} />

        {/* Employee routes - accessible by all roles */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "EMPLOYEE",
                "MANAGER",
                "HR",
                "ADMIN",
                "MODERATOR",
                "MARKETER",
              ]}
            />
          }
        >
          <Route path="/emp" element={<BaseLayout />}>
            {/* Common employee routes */}
            <Route index path="feed" element={<Feed />} />
            <Route path="events-calendar" element={<EventsCalendar />} />
            <Route path="all-departments/" element={<Departments />} />
            <Route path="all-departments/:id" element={<DepartmentDetails />} />
            <Route path="time-off" element={<TimeOff />} />
            <Route path="messages" element={<Messages />} />
            <Route path=":id" element={<FindEmployee />} />

            {/* Manager-specific sub-routes */}
            <Route element={<ProtectedRoute allowedRoles={["MANAGER"]} />}>
              {/* <Route
                path="time-off/my-requests"
                element={<MyTimeOffRequests />}
              /> */}
              <Route
                path="time-off/employee-requests"
                element={<EmployeeTimeOffRequests />}
              />
            </Route>
          </Route>
        </Route>

        {/* HR routes - accessible by HR and ADMIN only */}
        <Route element={<ProtectedRoute allowedRoles={["HR", "ADMIN"]} />}>
          <Route path="/hr" element={<BaseLayout />}>
            <Route index path="dashboard" element={<HRDashboard />} />
            <Route
              path="alldepartments"
              element={
                <WithPermission
                  resource="employeeRecords"
                  action="view"
                  redirectTo="/hr/dashboard"
                >
                  <AllDepartments />
                </WithPermission>
              }
            />
            <Route
              path={`alldepartments/department/:id`}
              element={<DepartmentPage />}
            />
            <Route
              path="manageemployees"
              element={
                <WithPermission
                  resource="employeeRecords"
                  action="edit"
                  redirectTo="/hr/dashboard"
                >
                  <ManageEmployees />
                </WithPermission>
              }
            />
            <Route
              path={`manageemployees/employee/:id`}
              element={<EmployeePage />}
            />

            <Route path="feed" element={<Feed />} />
            <Route path="time-off" element={<TimeOff />} />
            <Route path="emp-time-off" element={<EmployeeTimeOff />} />
            <Route path="events" element={<Events />} />

            {/* Recruitment routes - accessible by HR and ADMIN */}
            <Route path="recruitment">
              <Route
                path="employee"
                element={<RecruitmentPage type={RecruitmentType.EMPLOYEE} />}
              />
              <Route
                path="nss"
                element={<RecruitmentPage type={RecruitmentType.NSS} />}
              />
              <Route path="candidate/:id" element={<CandidateDetailView />} />
            </Route>
          </Route>
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
