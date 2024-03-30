import NavBar from "./components/navbar";
import { useState, useEffect } from "react";
import axios from 'axios';
import {
  Mic,
  CalendarDays,
  LayoutList,
  Users,
  Map,
  ArrowLeft,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Link, useLocation } from "react-router-dom";

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [agentResponse, setAgentResponse] = useState(null); // State to store the agent's response
  const [data, setData] = useState([]);
  const [displayInput, setDisplayInput] = useState(false);
  const [id, setId] = useState(0);
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const sendUserInput = () => {
    const id = uuidv4();
    setDisplayInput(false);
    setAgentResponse(null);
    const newData = {
      id: id,
      prompt: userInput,
      response: "Waiting for response...",
    }; // Initial response as a placeholder
    setId(id);
    setData([...data, newData]); // Add the new input to the data array immediately
    setIsAgent(true);
    fetch(
      process.env.REACT_APP_API_URL|| "http://localhost:5001/agent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_input: userInput }),
      }
    )
      .then((res) => res.json())
      .then((agentData) => {
        setData((currentData) =>
          currentData.map((item) =>
            item.prompt === userInput
              ? { ...item, response: agentData.response }
              : item
          )
        );

        setAgentResponse(agentData.response + "hola"); // Update the response in the data array
      })
      .finally(() => setIsLoading(false), setDisplayInput(true));
  };


  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Note: Adjust the URL based on your server's configuration
        const { data } = await axios.get(process.env.REACT_APP_AUTH_CHECK /*|| 'http://localhost:3001/auth-check'*/, { withCredentials: true });
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };

    checkAuthStatus();
  }, [isAuthenticated]);

  return (
    <div className=" w-full h-screen ">
      <div className="w-full flex flex-row h-screen ">
        <NavBar setIsNavOpen={setIsNavOpen} />
        {!isAgent && (
          <div className="w-full flex px-[200px] items-center ">
            <div className="flex flex-col justify-center text-center w-full  h-fit">
              <div>
                <text className="font-bold text-2xl">
                  Your very own digital secretary.
                </text>
              </div>
              <div className="flex flex-row items-center my-10 space-x-3">
                <input
                  className="h-[60px] w-full border-gray-200 border-solid border-2 p-2 rounded-md"
                  placeholder="Hi, how can I help you?"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendUserInput()} // Use onKeyDown to detect the Enter key press
                />
                <button
                  onClick={sendUserInput} // Call sendUserInput when the button is clicked
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Enter
                </button>
              </div>
              <div className="flex space-x-20 flex-row justify-center w-full">
                <CalendarDays size="40" />
                <LayoutList size="40" />
                <Users size="40" />
                <Map size="40" />
              </div>
            </div>
            <div className=" flex items-center">
              <Mic className="mx-3" size="50" />
            </div>
          </div>
        )}

        {isAgent && (
          <div
            className={`w-full h-screen flex justify-center transition-opacity duration-1000 ${
              isAgent ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-[500px] h-screen mt-10  flex-col overflow-auto">
              <div>
                <button
                  onClick={() => {
                    setIsAgent(false);
                    setAgentResponse(null);
                    setData([]);
                  }}
                >
                  <ArrowLeft color="black" size="20" />
                </button>
              </div>
              {data.map((item, index) => (
                <div key={index} className="my-4 rounded-md">
                  <div className="flex flex-col">
                    <div className="font-bold text-2xl duration-1000">
                      {item.prompt}
                    </div>
                    <div className="text-lg font-semibold my-3">Answer</div>
                    <div
                      className={`transition-opacity font- text-lg duration-1000 ${
                        item.id === id ? "opacity-100" : "opacity-200"
                      }`}
                    >
                      {item.response}
                    </div>
                  </div>
                </div>
              ))}

              {displayInput && (
                <div>
                  <input
                    placeholder="Type your follow up questions here"
                    className={`w-full  border-solid border-2 p-2 h-fit rounded-md transition-opacity duration-1000 ${
                      agentResponse ? "opacity-100" : "opacity-0"
                    }`}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendUserInput()}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
