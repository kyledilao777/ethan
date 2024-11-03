import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/navbar";
import Home from "./homepage";
import Calendar from "./calendar";
import RouteMap from "./routemap";
import Login from "./login";
import Documentation from "./documentation";
import Privacy from "./privacy";
import UserInfo from "./userinfo";
import Terms from "./termsofservice";
import Freemium from "./freemium";

export default function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/routemap" element={<RouteMap />} />
          <Route path="/userinfo" element={<UserInfo />} />
          <Route path="/termsofservice" element={<Terms />} />
          <Route path="/freemium" element={<Freemium />} />
        </Routes>
      </Router>
    </div>
  );
}
