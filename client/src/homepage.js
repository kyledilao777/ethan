import NavBar from "./components/navbar";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Mic,
  CalendarDays,
  LayoutList,
  Users,
  Map,
  ArrowLeft,
  Send,
  StickyNote,
  Linkedin,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Link, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import TypingEffect from "./components/typingeffect";

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [agentResponse, setAgentResponse] = useState(null); // State to store the agent's response
  const [data, setData] = useState([]);
  const [displayInput, setDisplayInput] = useState(false);
  const [id, setId] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstInput, setIsFirstInput] = useState(true);

  const [userInfo, setUserInfo] = useState({
    name: "",
    photo: "",
    email: "",
    calendarId: "",
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data } = await axios.get(
          /*process.env.REACT_APP_USER_INFO ||*/ "http://localhost:3001/user-info",
          { withCredentials: true }
        );
        // Update userInfo state with fetched data
        console.log(data.email, data.calendarId);
        setUserInfo({
          name: data.name,
          photo: data.photo,
          email: data.email,
          calendarId: data.calendarId,
        });
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    // Call fetchUserInfo function when component mounts
    fetchUserInfo();

    // Dependency array is empty, so this effect runs only once when the component mounts
  }, []);
  const sendUserInput = () => {
    const id = uuidv4();
    setDisplayInput(false);
    setAgentResponse(null);

    const currentInput = userInput; // Capture the current value of userInput
    setUserInput(""); // Clear the input field immediately
    const initialResponse = isFirstInput
      ? "Ethan takes around 1 minute to load... Please wait"
      : "...";
    console.log("response", initialResponse);
    const newData = {
      id: id,
      prompt: currentInput,
      response: initialResponse, // Placeholder response
      typingComplete: false, // Indicates typing has not started
      showTypingEffect: true, // Indicates whether to show typing effect
    };
    setId(id);
    setData([...data, newData]); // Add the new input to the data array immediately
    setIsAgent(true);
    fetch(/*process.env.REACT_APP_API_URL ||*/ "http://localhost:5001/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_input: userInput,
        user_email: userInfo.email,
        calendar_id: userInfo.calendarId,
      }),
    })
      .then((res) => res.json())
      .then((agentData) => {
        let itemResponse;

        if (!agentData.response) {
          itemResponse =
            "I'm sorry, I am still learning to understand you better. Could you rephrase your question?";
        } else {
          itemResponse = agentData.response;

          setData((currentData) =>
            currentData.map((item) =>
              item.id === id
                ? {
                    ...item,
                    response: itemResponse,
                    showTypingEffect: true,
                  }
                : item
            )
          );
        }

        setAgentResponse(agentData.response + "hola"); // Update the response in the data array

        console.log("User Input: ", userInput);
      })
      .catch((error) => {
        setData((currentData) =>
          currentData.map((item) =>
            item.id === id
              ? {
                  ...item,
                  response: `My apologies, I couldn't process your request at the moment. 
Please try again later or ask me something different. 
If you believe this is an error, feel free to contact support at 
kyle.untangled@gmail.com or evan.untangled@gmail.com. Thank you for your understanding!`,
                  showTypingEffect: false,
                }
              : item
          )
        );
      })
      .finally(() => setIsLoading(false), setDisplayInput(true));
    console.log("User Input: 2", userInput);
    setIsFirstInput(false);
  };

  const handleTypingComplete = (interactionId) => {
    console.log("onComplete function called");
    setData((data) =>
      data.map((item) =>
        item.id === interactionId ? { ...item, showTypingEffect: false } : item
      )
    );
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Note: Adjust the URL based on your server's configuration
        const { data } = await axios.get(
          process.env
            .REACT_APP_AUTH_CHECK /*||'http://localhost:3001/auth-check'*/,
          { withCredentials: true }
        );
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error("Error checking authentication status:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  const mainContentClass = isNavOpen
    ? "xsm:ml-[300px] sxl:ml-[0px]"
    : "px-[20px]";

  return (
    <div className=" w-full h-screen ">
      <div className="w-full flex sxl:flex-row xsm:flex-col h-screen">
        <NavBar setIsNavOpen={setIsNavOpen} />
        {!isAgent && (
          <div
            className={`w-full flex xl:px-[200px] flex-col xsm:px-[30px] sxl:px-[100px] justify-between my-auto items-center transition-all duration-300  ${mainContentClass}`}
          >
            <div className="flex flex-col justify-center text-center w-full h-fit">
              <div>
                <text className="font-bold sxl:text-2xl xsm:text-lg">
                  Your very own digital secretary.
                </text>
              </div>
              <div className="flex flex-row items-center xsm:my-3 sxl:my-10 space-x-3 ">
                <input
                  className="sxl:h-[60px] w-full border-gray-200 border-2 border-solid p-2 rounded-md"
                  placeholder="Hi, how can I help you?"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendUserInput()} // Use onKeyDown to detect the Enter key press
                />
                <div className="border-2 border-slate-200 rounded-md sxl:h-[60px]">
                  <button
                    onClick={sendUserInput} // Call sendUserInput when the button is clicked
                    className=" hover:bg-lightPurple sxl:h-[60px] text-white font-bold py-2 px-4 rounded"
                  >
                    <Send color="black" />
                  </button>
                </div>
              </div>

              {/* <div className="flex sxl:space-x-20 xsm:space-x-8 flex-row justify-center w-full">
              <CalendarDays size="40" />
              <LayoutList size="40" />
              <Users size="40" />
              <Map size="40" />
            </div> */}
            </div>
            <div className="flex flex-row justify-center space-x-5 mt-2 xsm:invisible sxl:visible items-center">
              <a href="https://untangled.carrd.co/">
                <img src="website.png" alt="website" className="h-[60px]" />
              </a>
              <a href="https://www.linkedin.com/in/evan-darren-christanto-675b33251/">
                <img src="linkedin.png" alt="linkedin" className="h-[40px]" />
              </a>
            </div>

            {/* <div className=" flex items-center">
            <Mic className="mx-3" size="50" />
          </div> */}
          </div>
        )}

        {isAgent && (
          <div
            className={`w-full h-screen flex justify-center transition-opacity duration-1000 ${
              isAgent ? "opacity-100" : "opacity-0"
            }`}
            lM
          >
            <div
              className={`w-full sxl:px-[150px] xsm:px-[30px] h-screen xsm:mt-20 sxl:mt-10 flex-col overflow-auto transition-all duration-300  ${mainContentClass}`}
            >
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
                <div key={index} className="my-3 rounded-md">
                  <div className="flex flex-col rounded-lg">
                    <text className="font-bold text-lg ">You</text>
                    <div className=" rounded-lg mb-1.5">{item.prompt}</div>
                    <text className="pt-3 font-bold text-lg">Ethan</text>
                    <div className="rounded-lg  ">
                      {" "}
                      {item.showTypingEffect ? (
                        <TypingEffect
                          message={item.response}
                          onComplete={() => handleTypingComplete(item.id)}
                        />
                      ) : (
                        <div className="" style={{ wordBreak: "break-word" }}>
                          {item.response}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {displayInput && (
                <div className="flex justify-between space-x-3 mt-5">
                  <input
                    placeholder="Type your follow up questions here"
                    className={`w-full border  border-solid px-1.5 py-2 h-fit rounded-md transition-opacity duration-1000 ${
                      agentResponse ? "opacity-100" : "opacity-0"
                    }`}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendUserInput()}
                  />
                  <div
                    className={`w-[50px] rounded-md flex justify-center border border-slate-200 transition-opacity duration-1000 ${
                      agentResponse ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <button
                      onClick={sendUserInput}
                      className="hover:bg-lightPurple w-full rounded-md px-3"
                    >
                      <Send />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
