import { ArrowLeft, Menu, StickyNote, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/userReducer";

export default function NavBar({
  setIsNavOpen,
  isHome,
  isCalendar,
  isInstruction,
  setIsAgent,
  setAgentResponse,
  setData,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFreePlan, setIsFreePlan] = useState(true); // Boolean to track plan type

  const name = useSelector((state) => state.user.name);
  const photo = useSelector((state) => state.user.photo);
  const email = useSelector((state) => state.user.email);
  const calendarId = useSelector((state) => state.user.calendarId);
  const occupation = useSelector((state) => state.user.occupation);
  const dispatch = useDispatch();

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        window.location.href = process.env.REACT_MAIN_URL /*|| "http://localhost:3000/login"*/;
      }
      return Promise.reject(error);
    }
  );

  const handleLogout = async () => {
    console.log("confirmation here 1");
    const confirmation = window.confirm("Are you sure you want to log out?");
    console.log(confirmation, "confirmation here 2");
    if (!confirmation) {
      return; // Abort logout if user cancels
    }
  
    axios.get(process.env.REACT_LOGOUT_URL /*|| "http://localhost:3001/logout"*/, {
      withCredentials: true,
    })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  
    // Refresh the page almost immediately after sending the request
    setTimeout(() => {
      console.log("Logout successful, reloading page...");
      window.location.reload();
    }, 100); // Adjust the timeout as needed
  };

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

  // useEffect(() => {
  //   const fetchUserInfo = async () => {
  //     try {
  //       const { data } = await axios.get(
  //         /*process.env
  //           .REACT_APP_USER_INFO ||*/ "http://localhost:3001/user-info",
  //         { withCredentials: true }
  //       );
  //       // Update userInfo state with fetched data
  //       let finalName;
  //       let finalPhoto;

  //       if (data.name === data.newName) {
  //           finalName = data.name;
  //       } else {
  //           finalName = data.newName;
  //       }

  //       if (data.photo === data.newPhoto) {
  //           finalPhoto = data.photo
  //       } else {
  //         finalPhoto = data.newPhoto
  //       }

  //       dispatch(setUserInfo({
  //         name: finalName,
  //         photo: finalPhoto,
  //         email: data.email,
  //         calendarId: data.calendarId,
  //       }));
  //     } catch (error) {
  //       console.error("Failed to fetch user info:", error);
  //     }
  //   };

  //   // Call fetchUserInfo function when component mounts
  //   fetchUserInfo();

  //   // Dependency array is empty, so this effect runs only once when the component mounts
  // }, []);

  const handleButton = () => {
    setIsOpen(true);
    setIsNavOpen(true);
  };

  const handleButton2 = () => {
    setIsOpen(false);
    setIsNavOpen(false);
  };

  const bgContentClass = isOpen ? "mt-5" : "bg-white";

  const bgMargin = isOpen ? "mt-5" : "mt-0";

  const bgMargin2 = isOpen ? "mt-2" : "mt-0";

  const navbarRef = useRef(null);

  const handleClickOutside = (event) => {
    if (navbarRef.current && !navbarRef.current.contains(event.target)) {
      setIsOpen(false);
      setIsNavOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <div className=" font-poppins">
      <div
        ref={navbarRef}
        className="w-full bg-white visible xsm:visible sxl:hidden xl:hidden xsm:fixed border h-[50px] flex justify-between px-[20px] py-[10px]"
      >
        <div className="visible xsm:visible sxl:hidden xl:hidden  ">
          {" "}
          {/* Ensure the sidebar and button don't affect the main layout */}
          {!isOpen && (
            <button onClick={handleButton} className="bg-white fixed z-30">
              <Menu size="30" /> {/* Replaced <text> with <span> */}
            </button>
          )}
          <div
            className={`fixed z-20 duration-500 left-0 top-0 h-screen bg-white transition-all border rounded-lg ${
              isOpen ? "w-[285px]" : "w-0"
            }`} // Use Tailwind's width utilities for animation
          >
            <div className="flex justify-center ">
              <div className="flex items-center space-x-5 h-20 mt-5">
                {isOpen && (
                  <div className="flex items-center space-x-5">
                    <div className="rounded-full bg-white h-[45px] w-[45px]">
                      <img
                        src={photo}
                        alt="User"
                        className="rounded-full h-[45px] w-[45px]"
                      />
                    </div>
                  </div>
                )}

                {isOpen && (
                  <div className="w-[150px] flex flex-col h-fit">
                    <span className="text-sm font-semibold text-gray-400">
                      {name}
                    </span>
                    <span className="text-sm font-semibold text-blueNav">
                      Free Plan
                    </span>
                    {isFreePlan && (
                      <button
                        onClick={() =>
                          window.open(
                            "https://untangled-ai.carrd.co/#ethanplus",
                            "_blank"
                          )
                        }
                        className="text-xs font-semibold bg-blueNav text-white py-1 mt-1 max-w-[130px] rounded"
                      >
                        Upgrade to Ethan+
                      </button>
                    )}
                    {isFreePlan && (
                      <button
                        onClick={() =>
                          window.open(
                            "https://untangled-ai.carrd.co/#ethanplus",
                            "_blank"
                          )
                        }
                        className="text-xs font-semibold bg-blueNav text-white py-1 mt-1 max-w-[130px] rounded"
                      >
                        Upgrade to Ethan+
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="overflow-hidden w-[285px]">
              {" "}
              {/* Prevents content from spilling out */}
              <div className="flex flex-col space-y-8 px-5">
                {" "}
                {/* Added padding and flex-column layout */}
                {isOpen && (
                  <div>
                    <div className="px-[5px]">
                      {" "}
                      <div className="bg-black opacity-30 w-full h-[1px] mt-5 "></div>
                    </div>

                    {/* <div className="mb-2 mt-5">
                      <text className="text-md text-blackNav opacity-70">
                        FEATURES
                      </text>
                    </div> */}
                    <div className="mt-8">
                      <div
                        className={`p-3 flex items-center ${
                          isHome ? "bg-slate-100" : "bg-white"
                        } rounded-lg`}
                      >
                        <Link
                          to={{ pathname: "/home" }}
                          className="flex flex-row  items-center"
                        >
                          <div className="flex flex-row items-center justify-between w-full space-x-5">
                            <img
                              src="ethan.svg"
                              className={`h-[30px] w-[30px] ${
                                isHome ? "opacity-100" : "opacity-80"
                              } `}
                              alt="ethan"
                            />
                            <text
                              className={`${
                                isHome
                                  ? "font-bold text-blueNav"
                                  : " font-medium text-blackNav opacity-70"
                              } `}
                            >
                              Ethan
                            </text>
                          </div>
                        </Link>
                      </div>
                      {/* <div
                        className={`p-3 flex items-center ${
                          isCalendar ? "bg-slate-100" : "bg-white"
                        } rounded-lg`}
                      >
                        <Link
                          to={{ pathname: "/calendar" }}
                          className="flex flex-row space-x-5 items-center"
                        >
                          <div className="flex flex-row items-center justify-between w-full space-x-5">
                            <img
                              src="calendar.svg"
                              className={`h-[30px] w-[30px] ${
                                isCalendar ? "opacity-100" : "opacity-80"
                              } `}
                            />
                            {/* <CalendarDays size="30" color="#1A5967" />{" "} */}
                      {/* <text
                              className={`${
                                isCalendar
                                  ? "font-bold text-blueNav"
                                  : " font-medium text-blackNav opacity-70"
                              } `}
                            >
                              Calendar
                            </text>
                          </div>
                        </Link>
                      </div> */}
                      {/* <div
                        className={`p-3 flex items-center ${
                          isCalendar ? "bg-slate-100" : "bg-white"
                        } rounded-lg`}
                      >
                        <Link
                          to={{ pathname: "/calendar" }}
                          className="flex flex-row space-x-5 items-center"
                        >
                          <div className="flex flex-row items-center justify-between w-full space-x-5">
                            <img
                              src="professional.svg"
                              className={`h-[30px] w-[30px] ${
                                isCalendar ? "opacity-100" : "opacity-80"
                              } `}
                              alt="calendar"
                            />
                            {/* <CalendarDays size="30" color="#1A5967" />{" "} */}
                      {/* <text
                              className={`${
                                isCalendar
                                  ? "font-bold text-blueNav"
                                  : " font-medium text-blackNav opacity-70"
                              } `}
                            >
                              For professionals
                            </text>
                          </div>
                        </Link>
                      </div> */}
                      {/* <div className="bg-black opacity-30 w-full h-[1px] mt-5">
                        <text className="text-white">halo</text>
                      </div> */}
                    </div>
                    <div>
                      {/* <div className="mt-5">
                        <text className="text-md text-blackNav opacity-70">
                          OTHERS
                        </text>
                      </div>

                      <div
                        className={`p-3 flex items-center mt-2 bg-white
                        }`}
                      >
                        <Link
                          to={{ pathname: "/documentation" }}
                          className="flex flex-row space-x-5 items-center"
                        >
                          <div className="flex flex-row items-center justify-between w-full space-x-5 ">
                            <img
                              src="setting.svg"
                              className={`h-[30px] w-[30px] opacity-80`}
                              alt="settings"
                            />
                            <text
                              className={`font-medium text-blackNav opacity-70
                                `}
                            >
                              Settings
                            </text>
                          </div>
                        </Link>
                      </div>
                      <div
                        className={`p-3 flex items-center mt-2 bg-white`}
                      >
                        <Link
                          to={{ pathname: "/documentation" }}
                          className="flex flex-row space-x-5 items-center"
                        >
                          <div className="flex flex-row items-center justify-between w-full space-x-5 ">
                            <img
                              src="chat.svg"
                              className={`h-[30px] w-[30px] opacity-80`}
                            />
                            <text
                              className={`font-medium text-blackNav opacity-70`}
                            >
                              Feedback
                            </text>
                          </div>
                        </Link>
                      </div> */}
                      <div
                        className={`p-3 flex items-center mt-2 rounded-lg ${
                          isInstruction ? "bg-slate-100" : "bg-white"
                        }`}
                      >
                        <Link
                          to={{ pathname: "/documentation" }}
                          className="flex flex-row space-x-5 items-center"
                        >
                          <div className="flex flex-row items-center justify-between w-full space-x-5 ">
                            <img
                              src="square.svg"
                              className={`h-[30px] w-[30px] ${
                                isInstruction ? "opacity-100" : "opacity-80"
                              } `}
                            />
                            <text
                              className={`${
                                isInstruction
                                  ? "font-bold text-blueNav"
                                  : " font-medium text-blackNav opacity-70"
                              } `}
                            >
                              Help
                            </text>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row  items-center space-x-3 ">
          <div className="flex flex-row justify-center space-x-3 items-center">
            <a href="https://untangled.carrd.co/">
              <img src="website.png" alt="website" className="h-[35px]" />
            </a>
            <a href="https://www.linkedin.com/company/untangled-ai">
              <img src="linkedin.png" alt="linkedin" className="h-[25px]" />
            </a>
          </div>
          <img src="logo.jpeg" alt="logo" className="h-[33px]" />
        </div>
      </div>

      <div
        className={`duration-500 visible xsm:hidden xl:block sxl:block h-full text-black ${
          isOpen ? "w-[285px]" : "w-[70px]"
        } transition-width border rounded-lg`}
        ref={navbarRef}
        onClick={handleButton}
      >
        <div className="flex justify-center">
          <div className="flex items-center space-x-5 h-20 mt-5">
            <div className="flex justify-center items-center rounded-full h-[45px] w-[45px]">
              <img
                src={photo}
                alt="User"
                className="rounded-full h-[45px] w-[45px]"
              />
            </div>
            {isOpen && (
              <div className="w-[150px] flex flex-col h-fit">
                <span className="text-sm font-semibold text-gray-400">
                  {name}
                </span>
                <span className="text-sm font-semibold text-blueNav">
                  Free Plan
                </span>
                {isFreePlan && (
                  <button
                    onClick={() =>
                      window.open(
                        "https://untangled-ai.carrd.co/#ethanplus",
                        "_blank"
                      )
                    }
                    className="text-xs font-semibold bg-blueNav text-white py-1 mt-1 max-w-[130px] rounded"
                  >
                    Upgrade to Ethan+
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="px-[20px]">
            {" "}
            <div className="bg-black opacity-40 w-full h-[1px] mt-5 "></div>
          </div>
        )}

        <div className="flex justify-center ">
          <div className=" w-[250px] flex justify-center items-center">
            <nav className=" flex w-fit justify-center ">
              <ul className="flex flex-col">
                <div className="mt-5">
                  {/* {isOpen && (
                      <div>
                        <text className="text-md text-blackNav opacity-70">
                          FEATURES
                        </text>
                      </div>
                    )} */}
                  <div
                    className={`mt-2 ${
                      isHome ? "bg-slate-100" : "bg-white"
                    }  p-3 items-center rounded-lg bg-black`}
                  >
                    <Link
                      to={{ pathname: "/home" }}
                      className="flex flex-row space-x-5 items-center"
                    >
                      <li>
                        {" "}
                        <img
                          src="ethan.svg"
                          className={`h-[30px] w-[30px] ${
                            isHome ? "opacity-100" : "opacity-80"
                          } `}
                        />
                      </li>
                      {isOpen && (
                        <button
                          className=""
                          onClick={() => {
                            dispatch(setIsAgent(false));
                            dispatch(setAgentResponse(null));
                            dispatch(setData([]));
                          }}
                        >
                          <text
                            className={`${
                              isHome
                                ? "font-bold text-blueNav"
                                : " font-medium text-blackNav opacity-70"
                            }`}
                          >
                            Ethan
                          </text>
                        </button>
                      )}
                    </Link>
                  </div>
                  {/* <div
                    className={`p-3 ${
                      isCalendar ? "bg-slate-100" : "bg-white"
                    } flex items-center rounded-lg`}
                  >
                    {" "}
                    <Link
                      to={{ pathname: "/calendar" }}
                      className="flex flex-row space-x-5 items-center"
                    >
                      <li>
                        {" "}
                        <img
                          src="calendar.svg"
                          className={`h-[30px] w-[30px] ${
                            isCalendar ? "opacity-100" : "opacity-80"
                          } `}
                        />
                      </li>
                      {isOpen && (
                        <div className=" ">
                          <text
                            className={`${
                              isCalendar
                                ? "font-bold text-blueNav"
                                : " font-medium text-blackNav opacity-70"
                            } `}
                          >
                            Calendar
                          </text>
                        </div>
                      )}
                    </Link>
                  </div> */}
                  {/* <div
                    className={`p-3 ${
                      isCalendar ? "bg-slate-100" : "bg-white"
                    } flex items-center rounded-lg`}
                  >
                    {" "}
                    <Link
                      to={{ pathname: "/" }}
                      className="flex flex-row space-x-5 items-center"
                    >
                      <li>
                        {" "}
                        <img
                          src="professional.svg"
                          className={`h-[30px] w-[30px] ${
                            isCalendar ? "opacity-100" : "opacity-80"
                          } `}
                        />
                      </li>
                      {isOpen && (
                        <div className=" ">
                          <text
                            className={`${
                              isCalendar
                                ? "font-bold text-blueNav"
                                : " font-medium text-blackNav opacity-70"
                            } `}
                          >
                            For professionals
                          </text>
                        </div>
                      )}
                    </Link>
                  </div> */}

                  {/* <Link
                    to={{ pathname: "/todo" }}
                    className="flex flex-row space-x-5 items-center"
                  >
                    <li>
                      {" "}
                      <LayoutList size="30" color="black" />{" "}
                    </li>
                    {isOpen && (
                      <div className="w-[72px]">
                        <text className=" font-medium">To do List</text>
                      </div>
                    )}
                  </Link>
                  <Link
                    to={{ pathname: "/meeting" }}
                    className="flex flex-row space-x-5 items-center"
                  >
                    <li>
                      {" "}
                      <Users size="30" color="black" />{" "}
                    </li>

                    {isOpen && (
                      <div className="">
                        <text className=" font-medium">Meetings</text>
                      </div>
                    )}
                  </Link> */}
                  <div>
                    {/* <Link
                      to={{ pathname: "/routemap" }}
                      className="flex flex-row space-x-5 items-center"
                    >
                      <li>
                        {" "}
                        <Map size="30" color="black" />{" "}
                      </li>
                      {isOpen && (
                        <div className="">
                          <text className="font-medium">Map</text>
                        </div>
                      )}
                    </Link> */}
                    {isOpen && <div className=" w-[238px] h-[1px]"></div>}
                  </div>
                  <div>
                    {/* {isOpen && (
                        <div className={`text-titleNav ${bgMargin} `}>
                          <text className="text-md  text-blackNav opacity-70">
                            OTHERS
                          </text>
                        </div>
                      )} */}

                    {/* <div
                        className={`${bgMargin2} "bg-white"
                         p-3 flex items-center rounded-lg `}
                      >
                        <Link
                          to={{ pathname: "/" }}
                          className="flex flex-row space-x-5 items-center"
                        >
                          <li>
                            {" "}
                            <img
                              src="setting.svg"
                              className={`h-[30px] w-[30px] opacity-80
                              `}
                            />
                          </li>
                          {isOpen && (
                            <div className="flex flex-row items-center justify-between w-[118px] ">
                              <text
                                className={`font-medium text-blackNav opacity-70
                                  `}
                              >
                                Settings
                              </text>
                            </div>
                          )}
                        </Link>
                      </div>
                      <div
                        className={`${bgMargin2}  "bg-white"
                         p-3 flex items-center rounded-lg `}
                      >
                        <Link
                          to={{ pathname: "/" }}
                          className="flex flex-row space-x-5 items-center"
                        >
                          <li>
                            {" "}
                            <img
                              src="chat.svg"
                              className={`h-[30px] w-[30px] opacity-80`}
                            />
                          </li>
                          {isOpen && (
                            <div className="flex flex-row items-center justify-between  w-[118px] ">
                              <text
                                className={`font-medium text-blackNav opacity-70
                                `}
                              >
                                Feedback
                              </text>
                            </div>
                          )}
                        </Link>
                      </div> */}
                    <div
                      className={`${bgMargin2} ${
                        isInstruction ? "bg-slate-100" : "bg-white"
                      } p-3 flex items-center rounded-lg `}
                    >
                      <Link
                        to={{ pathname: "/documentation" }}
                        className="flex flex-row space-x-5 items-center"
                      >
                        <li>
                          {" "}
                          <img
                            src="square.svg"
                            className={`h-[30px] w-[30px] ${
                              isInstruction ? "opacity-100" : "opacity-80"
                            } `}
                          />
                        </li>
                        {isOpen && (
                          <div className="flex flex-row items-center justify-between  w-[118px] ">
                            <text
                              className={`${
                                isInstruction
                                  ? "font-bold text-blueNav"
                                  : " font-medium text-blackNav opacity-70"
                              }`}
                            >
                              Help
                            </text>
                          </div>
                        )}
                      </Link>
                    </div>
                    <div className="flex flex-row items-center justify-between w-full space-x-5 mt-2 p-3 bg-white rounded-lg">
                      <button
                        onClick={handleLogout}
                        className="flex flex-row items-center w-full space-x-5"
                      >
                        <div><img
                          src="exit.png"
                          alt="exit"
                          className="h-[32px] w-[31px]"
                        /></div>
                        
                        {isOpen && (
                          <span className="font-medium text-blackNav opacity-70">
                            Logout
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </ul>
            </nav>
          </div>
        </div>
        {/* {isOpen && (
          <div
            className={`flex flex-row justify-center items-center w-full   space-x-8 px-5  mt-25vh`}
          >
            <a href="https://untangled.carrd.co/">
              <img
                src="new_website.png"
                alt="website"
                className="h-[40px] w-[40px]"
              />
            </a>
            <a href="https://www.linkedin.com/company/untangled-ai">
              <img
                src="linkedin.png"
                alt="linkedin"
                className="h-[40px] w-[40px]"
              />
            </a>
          </div>
        )} */}
      </div>
    </div>
  );
}

