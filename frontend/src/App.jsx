import { Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CompleteProfile from "./pages/CompleteProfile";
import Dashboard from "./pages/Dashboard";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import Requests from "./components/Requests";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { ImageModalProvider } from "./context/ImageModalContext";

function App() {
  return (
    <ImageModalProvider>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Signup />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </ImageModalProvider>
  );
}

export default App;
