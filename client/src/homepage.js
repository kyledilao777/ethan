import NavBar from "./components/navbar";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { ArrowLeft, ArrowDown, RefreshCw, Send } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";
import TypingEffect from "./components/typingeffect";
import { useSelector, useDispatch } from "react-redux";
import { setUserInfo } from "./redux/reducers/userReducer";
import { setIsAgent } from "./redux/reducers/agentReducer";
import { setAgentResponse } from "./redux/reducers/agentReducer";
import { setDisplayInput } from "./redux/reducers/uiReducer";
import { setData } from "./redux/reducers/userReducer";
import { updateDataById } from "./redux/reducers/userReducer";
import { setTypingEffect } from "./redux/reducers/userReducer";
import { setIsAuthenticated } from "./redux/reducers/userReducer";
import { current } from "@reduxjs/toolkit";
import { setUserInput } from "./redux/reducers/userReducer";
import ReactGA from "react-ga"

export default function Home() {
  const [timezone, setTimezone] = useState("UTC"); // Default timezone
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  //const [isAgent, setIsAgent] = useState(false);
  const userInput = useSelector((state) => state.user.input);
  const agentResponse = useSelector((state) => state.agent.agentResponse);
  const data = useSelector((state) => state.user.data);
  const displayInput = useSelector((state) => state.ui.displayInput);
  const [isFirstInput, setIsFirstInput] = useState(true);
  const name = useSelector((state) => state.user.name);
  const photo = useSelector((state) => state.user.photo);
  const email = useSelector((state) => state.user.email);
  const calendarId = useSelector((state) => state.user.calendarId);
  const occupation = useSelector((state) => state.user.occupation);
  const isAgent = useSelector((state) => state.agent.isAgent);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const [firstTypingComplete, setFirstTypingComplete] = useState(false);
  const containerRef = useRef(null);

  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const checkIfScrollable = () => {
      setIsScrollable(document.documentElement.scrollHeight > document.documentElement.clientHeight);
    };

    checkIfScrollable();
    window.addEventListener("resize", checkIfScrollable);
    console.log(isScrollable, "isScrollable")
    return () => {
      window.removeEventListener("resize", checkIfScrollable);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data]);


  const rotatingMessages = [
    "To start, say “Hi Ethan”.",
    'Ask Ethan, "What do I have on my calendar today?"',
    "To create a meeting, type “Schedule a meeting for me at 2.30 pm today.”",
  ];

  const [currentMessage, setCurrentMessage] = useState(rotatingMessages[0]);
  const [index, setIndex] = useState(0);

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

        // Update userInfo state with fetched dxata
        let finalName;
        let finalPhoto;

        if (data.name === data.newName) {
          finalName = data.name;
        } else {
          finalName = data.newName;
        }

        if (data.photo === data.newPhoto) {
          finalPhoto = data.photo;
        } else {
          finalPhoto = data.newPhoto;
        }

        dispatch(
          setUserInfo({
            name: finalName,
            photo: finalPhoto,
            email: data.email,
            calendarId: data.calendarId,
            occupation: data.occupation,
          })
        );
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    // Call fetchUserInfo function when component mounts
    fetchUserInfo();

    // Dependency array is empty, so this effect runs only once when the component mounts
  }, [dispatch]);

  const parseResponse = (response) => {
    // Custom parsing logic based on your response format
    const titleMatch = response.match(/Event Name:\s(.+)/);
    const dateMatch = response.match(/Start:\s(.+)/);
    const startMatch = response.match(/Start:\s(.+)/);
    const endMatch = response.match(/End:\s(.+)/);
    const attendeesMatch = response.match(/Attendee:\s(.+)/);
    const linkMatch = response.match(/Link:\s\[(.+?)\]/);

    const details = {
      title: titleMatch ? titleMatch[1] : "No title found",
      date: dateMatch ? dateMatch[1] : "No date found",
      startTime: startMatch ? startMatch[1] : "No time found",
      endTime: endMatch ? endMatch[1] : "No time found",
      attendees: attendeesMatch ? attendeesMatch[1].split(", ") : [],
      link: linkMatch ? linkMatch[1] : "#",
    };

    return details;
  };

  const eventsIHave = (response) => {
    const eventMatches = response.match(
      /\d+\.\s.+\sat\s\d{1,2}:\d{2}\s[APM]{2}/g
    );
    console.log(eventMatches);
  };

  useEffect(() => {
    // Fetch the timezone when the component mounts
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(userTimezone); // Set the fetched timezone in state
  }, []);

  const sendUserInput = async () => {
    ReactGA.event({
      category: 'User',
      action: 'Send Response',
      label: 'User Send Response'
    });

    console.log(userInput, " this is the real user input");
    const id = uuidv4();

    dispatch(setDisplayInput(false));
    dispatch(setAgentResponse(null));

    const initialResponse = "Loading...";
    const currentInput = userInput; // Capture the current value of userInput

    console.log(currentInput, "this is current input");

    dispatch(setUserInput(""));

    const newData = {
      id: id,
      prompt: currentInput,
      response: initialResponse, // Placeholder response
      typingComplete: false, // Indicates typing has not started
      showTypingEffect: true, // Indicates whether to show typing effect
    };

    dispatch(setData([...data, newData])); // Add the new input to the data array immediately
    dispatch(setIsAgent(true));
    await fetch(
      process.env.REACT_APP_API_URL /*|| "http://localhost:5001/agent"*/,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_input: userInput,
          user_email: email,
          calendar_id: calendarId,
          timezone: timezone,
        }),
      }
    )
      .then((res) => res.json())
      .then((agentData) => {
        let parsedDetails;
        let staticMessage;
        let isScheduled;
        let isReadSchedule;
        let isDeleteSchedule;
        let isUpdateSchedule;

        console.log(agentData.eventDetails, "This is session from homepage");

        const temporaryResponse = agentData.response;

        if (agentData.eventDetails) {
          if (agentData.intent === "read" || agentData.intent === "delete") {
            if (agentData.eventDetails.length > 0) {
              parsedDetails = transformToday(
                agentData.eventDetails,
                agentData.intent
              );

              if (agentData.intent === "delete") {
                parsedDetails = parsedDetails[0];
              }
            }
          } else {
            if (
              agentData.eventDetails.event_name ||
              agentData.eventDetails.title
            ) {
              parsedDetails = agentData.eventDetails;
              if (agentData.intent === "update") {
                parsedDetails["current_start_time"] = extractTime(
                  parsedDetails["original_start"]
                );
                parsedDetails["current_end_time"] = extractTime(
                  parsedDetails["original_end"]
                );
                parsedDetails["updated_start_time"] = extractTime(
                  parsedDetails["updated_start"]
                );
                parsedDetails["updated_end_time"] = extractTime(
                  parsedDetails["updated_end"]
                );
                parsedDetails["start_date"] = extractDate(
                  parsedDetails["original_start"]
                );
                parsedDetails["end_date"] = extractDate(
                  parsedDetails["updated_end"]
                );
              } else {
                parsedDetails["start_time"] = extractTime(
                  parsedDetails.start_datetime
                );
                parsedDetails["end_time"] = extractTime(
                  parsedDetails.end_datetime
                );
                parsedDetails["date"] = extractDate(
                  parsedDetails.start_datetime
                );
              }
            }
          }

          if (agentData.intent === "create") {
            isScheduled = true;
          } else if (agentData.intent === "delete") {
            isDeleteSchedule = true;
          } else if (agentData.intent === "update") {
            isUpdateSchedule = true;
          } else if (agentData.intent === "read") {
            isReadSchedule = true;
          }
        }

        let itemResponse;

        try {
          if (!temporaryResponse) {
            itemResponse =
              "An error occurred. Please try again later.";
          } else {
            itemResponse = temporaryResponse;
          }
          dispatch(
            updateDataById({
              id,
              newData: {
                response: itemResponse,
                showTypingEffect: true, //true
                parsedDetails: parsedDetails,
                staticMessage: staticMessage,
                isReadSchedule: isReadSchedule ? true : null,
                isScheduled: isScheduled ? true : null,
                isDeleteSchedule: isDeleteSchedule ? true : null,
                isUpdateSchedule: isUpdateSchedule ? true : null,
              },
            })
          );
          dispatch(setAgentResponse(itemResponse)); // Update the response in the data array
          dispatch(setUserInput(""));
        } catch (error) {
          console.error("Error processing data:", error);
          throw error; // Rethrow to ensure it's caught by .catch()
        }
      })
      .catch((error) => {
        console.error("Error caught:", error);
      })
      .finally(() => dispatch(setDisplayInput(true)));

    setIsFirstInput(false);
  };

  const handleTypingComplete = (interactionId) => {
    console.log("onComplete function called");

    setFirstTypingComplete(false);

    dispatch(
      setTypingEffect({
        id: interactionId,
        showTypingEffect: false,
      })
    );
  };

  const transformToday = (eventList, intent) => {
    return eventList.map((event) => {
      // Split the event string to extract the name, start time, and end time
      let [name, times] = event.split(": ");
      let [start_time, end_time] = times.split(" to ");
      let real_end_time;
      let event_id;

      const matches = end_time.split(" ");
      real_end_time = matches[0];

      console.log(real_end_time, "this is real end time");

      // Create a dictionary for the event
      return {
        name: name,
        start_time: extractTime(start_time),
        end_time: extractTime(real_end_time),
        date: extractDate(start_time),
      };
    });
  };

  const extractToday = (text) => {
    const regex =
      /*/(\d+\.\s*)?([\w\s]+?)\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/gi;*/
      /titled\s+"([^"]+)"\s+scheduled\s+for\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/gi;
    let match;
    const events = [];

    while ((match = regex.exec(text)) !== null) {
      console.log(match, "From extractEventDetails");
      events.push({
        name: match[1].trim(),
        time: match[2].trim(),
      });
    }

    return events;
  };

  // const SpecificResponseUI = ({ item }) => {
  //   const details = item.parsedDetails;
  //   const combinedMessage = `
  //   Title: ${details.title}
  //   Date: ${details.date}
  //   Time: ${details.startTime} - ${details.endTime}
  //   Attendees: ${details.attendees.join(", ")}
  //   View Event: ${details.link}
  //   `;

  //   return (
  //     <div className="rounded-xl border w-full p-4 mt-1 bg-white">
  //       <div className="text-gray-700">
  //         {item.showTypingEffect ? (
  //           <TypingEffect
  //             message={combinedMessage.trim()}
  //             onComplete={() => handleTypingComplete(item.id)}
  //           />
  //         ) : (
  //           <div className="" style={{ wordBreak: "break-word" }}>
  //             {item.parsedDetails}
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // };

  const extractDate = (datetime) => {
    const date = new Date(datetime);
    const day = date.getDate();
    const month = date.toLocaleString("en-GB", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const extractTime = (dateTime) => {
    const date = new Date(dateTime);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const extractTimeToday = (dateTime) => {
    const date = new Date(dateTime);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Note: Adjust the URL based on your server's configuration
        const { data } = await axios.get(
          process.env
            .REACT_APP_AUTH_CHECK /*|| "http://localhost:3001/auth-check"*/,
          { withCredentials: true }
        );

        dispatch(setIsAuthenticated(data.isAuthenticated));
        console.log(`hello\nworld`);
      } catch (error) {
        console.error("Error checking authentication status:", error);
        dispatch(setIsAuthenticated(false));
      } finally {
        setTimeout(() => setIsLoading(false), 2000); // Set loading to false after the check is complete
      }
    };

    checkAuthStatus();
  }, []);

  const mainContentClass = isNavOpen
    ? isAgent ? "xsm:ml-[170px] sxl:ml-[0px]" : "xsm:ml-[300px] sxl:ml-[0px]"
    : "px-[20px]";



  return (
    <div className={`w-full ${isScrollable ? "h-fit" : "h-screen"}`}>
      <div className="w-full flex sxl:flex-row xsm:flex-col h-screen">
        <NavBar setIsNavOpen={setIsNavOpen} isHome={true} setIsAgent={setIsAgent} setAgentResponse={setAgentResponse} setData={setData} />
        <div
          className={`flex flex-col w-full h-full transition-all duration-300 ${mainContentClass} `}
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
                <div className="relative w-full flex items-center my-4">
                  <textarea
                    className="sxl:h-[46px] w-full min-h-[46px] border-gray-200 border-2 border-solid p-2 rounded-2xl mt-1 text-black pr-10"
                    placeholder="Hi, how can I help you?"
                    value={userInput}
                    onChange={(e) => dispatch(setUserInput(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault(); // Prevents the default behavior of Enter key
                        sendUserInput();
                      }
                    }} // Use onKeyDown to detect the Enter key press
                  />
                  <button
                    onClick={sendUserInput} // Call sendUserInput when the button is clicked
                    className="absolute right-2 bottom-2 bg-white rounded-full p-1"
                  >
                    <Send color="black" />
                  </button>
                </div>
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
                {data.map((item, index) => (
                  <div key={index} className="my-3 rounded-md">
                    <div className="flex flex-col rounded-lg my-7">
                      <div className="flex justify-end">
                        <div className="flex justify-end space-x-2 max-w-1/2">
                          <div className="flex flex-row space-x-2">
                            <div className="flex flex-col w-full">
                              <div className="w-full text-end">
                                <text className="font-bold text-lg">You</text>
                              </div>
                              <div
                                className="rounded-xl mb-1.5 bg-blueNav opacity-90 text-white py-2 px-3 mt-1"
                                style={{ whiteSpace: "pre-wrap" }}
                              >
                                {item.prompt}
                              </div>
                            </div>
                            <div className="w-[40px] h-[40px] flex-shrink-0 flex items-end">
                              {" "}
                              <img
                                src={photo}
                                alt="logo"
                                className="rounded-full  w-full h-full border"
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
                            <div className="rounded-xl border w-full mt-1 py-1 px-3">
                              {item.parsedDetails ? (
                                <div className="">
                                  {item.showTypingEffect ? (
                                    <div className="flex flex-col">
                                      <TypingEffect
                                        message={item.response}
                                        onComplete={() => {
                                          handleTypingComplete(item.id);
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      className=""
                                      style={{
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      <ReactMarkdown className="prose prose-xs leading-loose">
                                        {item.response}
                                      </ReactMarkdown>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>
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
                                      <ReactMarkdown className="prose prose-xs leading-loose">
                                        {item.response}
                                      </ReactMarkdown>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="absolute bottom-8 right-10">
                <button
                     onClick={
                      scrollToBottom
                    }
                    className="p-2 bg-gray-300 rounded-full"
                  >
                    <ArrowDown color="black" size={20} />
                  </button>
                </div>
                <div className="absolute bottom-8 right-20">
                  <button
                    onClick={() => {
                      ReactGA.event({
                        category: 'User',
                        action: 'Reloads',
                        label: 'User Reloads'
                      });

                      dispatch(setIsAgent(false));
                      dispatch(setAgentResponse(null));
                      dispatch(setData([]));
                      window.location.reload(); // Assuming this is the reset action
                    }}
                    className="p-2 bg-gray-300 rounded-full"
                  >
                    <RefreshCw color="black" size="20" />
                  </button>
                </div>
                {displayInput && (
                  <div className="relative w-full flex items-center bg-white">
                    <div className="relative w-full flex items-center ">
                      <textarea
                        className="sxl:h-[46px] w-full min-h-[46px] border-gray-200 border-2 border-solid p-2 rounded-2xl text-black pr-10"
                        value={userInput}
                        onChange={(e) => dispatch(setUserInput(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault(); // Prevents the default behavior of Enter key
                            sendUserInput();
                          }
                        }} // Use onKeyDown to detect the Enter key press
                      />
                      <button
                        onClick={sendUserInput} // Call sendUserInput when the button is clicked
                        className="absolute right-4 bottom-3 bg-white rounded-full"
                      >
                        <Send color="black" />
                      </button>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
          {
            !isAgent && (
              <div className="flex justify-center h-[30px] space-x-3 items-center text-gray-500">
              <Link to={{ pathname: "/privacy" }}>
                <text>Privacy</text>
              </Link>
  
              <text className="">© 2024 Untangled AI. All rights reserved.</text>
            </div>
            )
          }
          
        </div>
      </div>
    </div>
  );
}

// {item.isScheduled &&
//   !item.isDeleteSchedule &&
//   !item.isReadSchedule &&
//   !item.isUpdateSchedule && (
//     <div className="flex flex-row items-center space-x-3 mt-3">
//       <div className="font-bold text-blue-600">
//         Created
//       </div>
//       <div className="h-full bg-blue-500 w-fit flex flex-row">
//         <div className="h-fit w-[3px] bg-blue-600"></div>
//         <div className="bg-blue-50 w-full py-2 px-3 whitespace-pre-wrap">
//           {item.parsedDetails.date && (
//             <div className="text-blue-600 text-sm">
//               {`${item.parsedDetails.date}`}
//             </div>
//           )}
//           {item.parsedDetails
//             .start_time && (
//             <div className="flex flex-row items-center space-x-1 text-blue-600 font-bold">
//               <div>{`${item.parsedDetails.start_time}`}</div>
//               <div>-</div>
//               <div>{`${item.parsedDetails.end_time}:`}</div>
//               <div className="text-black font-normal ml-1">
//                 {`${item.parsedDetails.event_name}`}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )}

// {!item.isScheduled &&
//   !item.isDeleteSchedule &&
//   item.isReadSchedule &&
//   !item.isUpdateSchedule && (
//     <div className="flex flex-row py-2">
//       <div className=" w-[3px] bg-blue-500">
//         {" "}
//       </div>
//       <div className="bg-blue-50 px-3 space-y-2 w-full py-2">
//         {item.parsedDetails.map(
//           (detail, index) => (
//             <div
//               key={index}
//               className={``}
//             >
//               <div className="flex flex-row space-x-3">
//                 <div className="text-blue-600 font-bold">
//                   {detail.start_time} -{" "}
//                   {detail.end_time}
//                 </div>

//                 <div>{`${detail.name}`}</div>
//               </div>
//             </div>
//           )
//         )}
//       </div>
//     </div>
//   )}

// {!item.isScheduled &&
//   !item.isReadSchedule &&
//   item.isDeleteSchedule &&
//   !item.isUpdateSchedule && (
//     <div>
//       <div className="flex flex-row items-center space-x-3">
//         <div className="mt-3 font-bold text-red-500">
//           Deleted
//         </div>
//         <div className="h-full bg-red-500 w-fit flex flex-row mt-3">
//           <div className="h-fit w-[3px] "></div>
//           <div className=" bg-red-50 w-full py-2 px-3 whitespace-pre-wrap flex flex-row space-x-3">
//             <div className="text-red-500 font-bold">
//               {`${item.parsedDetails.start_time} - ${item.parsedDetails.end_time}:`}
//             </div>
//             <div className="">
//               {`${item.parsedDetails.name}`}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )}

// {!item.isScheduled &&
//   !item.isReadSchedule &&
//   !item.isDeleteSchedule &&
//   item.isUpdateSchedule && (
//     <div>
//       <div className="flex flex-col space-y-3 w-fit ">
//         <div className="flex flex-row space-x-[19px] items-center">
//           <div className=" mt-3 h-fit font-bold text-blue-600">
//             Previous
//           </div>
//           <div className="flex flex-row mt-3">
//             <div className=" w-[3px] bg-blue-500">
//               {" "}
//             </div>
//             <div className="bg-blue-50 flex flex-row space-x-3 py-2">
//               <div className="w-full mx-3 flex flex-row space-x-3">
//                 <div className="font-bold text-blue-600">
//                   {
//                     item.parsedDetails
//                       .current_start_time
//                   }{" "}
//                   -{" "}
//                   {
//                     item.parsedDetails
//                       .current_end_time
//                   }
//                 </div>
//                 <div>
//                   {
//                     item.parsedDetails
//                       .title
//                   }
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="flex flex-row space-x-3 items-center">
//           <div className=" h-fit pr-2 font-bold text-blueNav">
//             Updated
//           </div>
//           <div className="flex flex-row">
//             <div className=" w-[3px] bg-blueNav bg-">
//               {" "}
//             </div>
//             <div className=" bg-green-50 flex flex-row space-x-3 py-2">
//               <div className="w-full mx-3 flex flex-row space-x-3">
//                 <div className="text-blueNav font-bold">
//                   {
//                     item.parsedDetails
//                       .updated_start_time
//                   }{" "}
//                   -{" "}
//                   {
//                     item.parsedDetails
//                       .updated_end_time
//                   }
//                 </div>
//                 <div>
//                   {
//                     item.parsedDetails
//                       .title
//                   }
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )}
// </div>
