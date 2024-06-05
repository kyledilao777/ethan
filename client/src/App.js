import { BrowserRouter as Router, Routes, Route} from "react-router-dom";

import Home from "./homepage";
import Calendar from "./calendar";
import Meeting from "./meeting";
import Todo from "./todo";
import RouteMap from "./routemap"
import Login from "./login"
import Documentation from "./documentation"
import Privacy from "./privacy";
import UserInfo from "./userinfo";


export default function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/home" element={<Home />}/>
          <Route path="/calendar" element={<Calendar />}/>
          <Route path="/privacy" element={<Privacy />}/>
          <Route path="/documentation" element={<Documentation />}/>
          <Route path="/meeting" element={<Meeting />}/>
          <Route path="/todo" element={<Todo />}/>
          <Route path="/routemap" element={<RouteMap />}/>
          <Route path="/userinfo" element={<UserInfo />}/>
        </Routes>
      </Router>
    </div>
  )
}