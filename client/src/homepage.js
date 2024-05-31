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
import TypingEffect from "./components/typingeffect";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

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
  const [events, setEvents] = useState([]);
  const [calendar, setCalendar] = useState([]);

  const rotatingMessages = [
    "To start, say “Hi Ethan”.",
    'Ask Ethan, "What do I have on my calendar today?"',
    "To create a meeting, type “Schedule a meeting for me at 2.30 pm today.”",
  ];

  const [currentMessage, setCurrentMessage] = useState(rotatingMessages[0]);
  const [index, setIndex] = useState(0);

  const [userInfo, setUserInfo] = useState({
    name: "",
    photo: "",
    email: "",
    calendarId: "",
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      const nextIndex = (index + 1) % rotatingMessages.length;
      setIndex(nextIndex);
      setCurrentMessage(rotatingMessages[nextIndex]);
    }, 5000);

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, [index]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data } = await axios.get(
          process.env
            .REACT_APP_USER_INFO /*|| "http://localhost:3001/user-info"*/,
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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          process.env.REACT_APP_FETCH_CALENDAR_URL /*||  "http://localhost:3001/fetch-calendar-events"*/,
          {
            withCredentials: true,
          }
        );
        const transformedEvents = res.data.map((event) => {
          const start = event.start?.dateTime || event.start?.date;
          const end = event.end?.dateTime || event.end?.date;
          const allDay = Boolean(event.start?.date);
          return {
            ...event,
            start: start,
            end: end,
            allDay,
          };
        });
        const transformedEventsCalendar = res.data.map((event) => {
          const start = event.start?.dateTime || event.start?.date;
          const end = event.end?.dateTime || event.end?.date;
          const allDay = Boolean(event.start?.date);
          return {
            id: event.id,
            title: event.summary,
            start: start,
            end: end,
          };
        });
        setEvents(transformedEvents);
        setCalendar(transformedEventsCalendar);
        const today = new Date().toISOString().split("T")[0];
        const todayToDoList = transformedEvents.filter((event) => {
          if (event.start) {
            return today === event.start.split("T")[0];
          }
        });
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      }
    };

    fetchEvents();
  }, [events]);

  const sendUserInput = () => {
    const id = uuidv4();
    setDisplayInput(false);
    setAgentResponse(null);

    const initialResponse = isFirstInput ? "Booting up..." : "Loading...";
    const currentInput = userInput; // Capture the current value of userInput
    setUserInput("");
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
    fetch(process.env.REACT_APP_API_URL /*|| "http://localhost:5001/agent"*/, {
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

        try {
          if (!agentData.response) {
            itemResponse =
              "I'm sorry, I am still learning to understand you better. Could you rephrase your question?";
          } else {
            itemResponse = agentData.response;
          }

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
          setAgentResponse(itemResponse); // Update the response in the data array
          setUserInput("");
        } catch (error) {
          console.error("Error processing data:", error);
          throw error; // Rethrow to ensure it's caught by .catch()
        }
      })
      .catch((error) => {
        console.error("Error caught:", error);
      })
      .finally(() => setIsLoading(false), setDisplayInput(true));

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
    localStorage.setItem("isAgent", isAgent.toString());
  }, [isAgent]);

  // useEffect(() => {
  //   const checkAuthStatus = async () => {
  //     try {
  //       // Note: Adjust the URL based on your server's configuration
  //       const { data } = await axios.get(
  //         process.env
  //           .REACT_APP_AUTH_CHECK /*||'http://localhost:3001/auth-check'*/,
  //         { withCredentials: true }
  //       );
  //       setIsAuthenticated(data.isAuthenticated);
  //     } catch (error) {
  //       console.error("Error checking authentication status:", error);
  //       setIsAuthenticated(false);
  //     }
  //   };

  //   checkAuthStatus();
  // }, []);

  const mainContentClass = isNavOpen
    ? "xsm:ml-[300px] sxl:ml-[0px]"
    : "px-[20px]";

  return (
    <div className=" w-full h-full ">
      <div className="w-full flex sxl:flex-row xsm:flex-col h-screen">
        <NavBar setIsNavOpen={setIsNavOpen} isHome={true} />
        <div
          className={`flex flex-col w-full h-full transition-all duration-300 ${mainContentClass}`}
        >
          {!isAgent && (
            <div
              className={`w-full flex xl:px-[200px] flex-col xsm:px-[30px] sxl:px-[100px] justify-between my-auto items-center`}
            >
              <div className="flex flex-col justify-center text-center w-full h-fit ">
                <div>
                  <text className="font-bold sxl:text-2xl xsm:text-lg text-animation animate-fadeInOut">
                    {currentMessage}
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
              </div>
              <div className="flex flex-row justify-center space-x-5 xsm:invisible sxl:visible items-center">
                <a href="https://untangled.carrd.co/">
                  <img src="website.png" alt="website" className="h-[60px]" />
                </a>
                <a href="https://www.linkedin.com/company/untangled-ai">
                  <img src="linkedin.png" alt="linkedin" className="h-[40px]" />
                </a>
              </div>

              
            </div>
          )}

          {isAgent && (
            <div
              className={`w-full h-full flex justify-center transition-opacity duration-1000 ${
                isAgent ? "opacity-100" : "opacity-0"
              }`}
              lM
            >
              {/* <div className=" bg-slate-300">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  events={events}
                  selectable={true}
                />
              </div> */}
              <div
                className={`w-full text-justify sxl:px-[100px] sxl:py-[20px] xsm:py-[10px] xsm:px-[20px] xsm:mt-20 sxl:mt-10 flex-col overflow-auto transition-all duration-300  ${mainContentClass}`}
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
                    <div className="flex flex-col rounded-lg my-7">
                      <div className="flex justify-end">
                        <div className="flex justify-end space-x-2 max-w-1/2">
                          <div className="flex flex-row space-x-2">
                            <div className="flex flex-col w-full text-end">
                              <div>
                                <text className="font-bold text-lg">You</text>
                              </div>
                              <div className=" rounded-xl mb-1.5 bg-blueNav opacity-90 text-white p-2 mt-1">
                                {item.prompt}
                              </div>
                            </div>
                            <div className="w-[40px] h-[40px] flex-shrink-0 flex items-end">
                              {" "}
                              <img
                                src={userInfo.photo}
                                alt="logo"
                                className="rounded-full  border"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row space-x-2 w-full mt-3 ">
                        <div className="w-[40px] h-[40px] flex-shrink-0 flex items-end">
                          {" "}
                          <img
                            src="logo.jpeg"
                            alt="logo"
                            className="rounded-full  border"
                          />
                        </div>

                        <div className="max-w-full">
                          <div>
                            {" "}
                            <text className="pt-3 font-bold text-lg ">
                              Ethan
                            </text>
                          </div>
                          <div>
                            <div className="rounded-xl border w-full p-2 mt-1">
                              {" "}
                              {item.showTypingEffect ? (
                                <TypingEffect
                                  message={item.response}
                                  onComplete={() =>
                                    handleTypingComplete(item.id)
                                  }
                                />
                              ) : (
                                <div
                                  className=""
                                  style={{ wordBreak: "break-word" }}
                                >
                                  {item.response}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {displayInput && (
                  <div className="flex justify-between space-x-3 mt-10">
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
          <div className="flex justify-center h-[30px] space-x-3 items-center text-gray-500">
            <Link to={{ pathname: "/privacy" }}>
              <text>Privacy</text>
            </Link>

            <text className="">© 2024 Untangled AI. All rights reserved.</text>
          </div>
        </div>
      </div>
    </div>
  );
}

