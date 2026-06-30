import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CompleteProfile from "./pages/CompleteProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Signup />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/complete-profile"
          element={<CompleteProfile />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
