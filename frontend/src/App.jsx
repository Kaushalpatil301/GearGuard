import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import MaintenanceCalendar from "./pages/MaintainceCalender";
import EquipmentList from "./pages/EquipmentList";
import EquipmentDetailPage from "./pages/EquipmentDetailPage";
import TeamsManagement from "./pages/TeanManagement";
import getActiveViewFromPath from "./components/AppLayout";
import NewRequestForm from "./components/NewRequestForm";
import NewRequestPage from "./pages/NewRequestPage";

const AppLayout = () => {
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const activeView = getActiveViewFromPath(location.pathname);

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup";

  return (
    <>
      {!hideNavbar && (
        <Navbar
          activeView={activeView}
          onNewRequest={() => {
            setIsCreating(true);
            setSelectedRequest(null);
          }}
          onSearch={setSearchTerm}
          searchTerm={searchTerm}
          isMinimal={isCreating || !!selectedRequest}
        />
      )}

      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard
                searchTerm={searchTerm}
                isCreating={isCreating}
                setIsCreating={setIsCreating}
                selectedRequest={selectedRequest}
                setSelectedRequest={setSelectedRequest}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <MaintenanceCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment"
          element={
            <ProtectedRoute>
              <EquipmentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment/:id"
          element={
            <ProtectedRoute>
              <EquipmentDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <TeamsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/new"
          element={
            <ProtectedRoute>
              <NewRequestPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </>
  );
};

const App = () => (
  <Router>
    <AppLayout />
  </Router>
);

export default App;
