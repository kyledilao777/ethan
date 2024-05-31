import {
  CalendarDays,
  LayoutList,
  Users,
  Map,
  Bot,
  Settings,
  ArrowRight,
  ArrowLeft,
  Home,
  Menu,
  StickyNote,
  Linkedin,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

export default function NavBar({
  setIsNavOpen,
  isHome,
  isCalendar,
  isInstruction,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", photo: "" });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data } = await axios.get(
          /*process.env
            .REACT_APP_USER_INFO ||*/ "http://localhost:3001/user-info",
          { withCredentials: true }
        );
        // Update userInfo state with fetched data
        setUserInfo({ name: data.name, photo: data.photo });
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    // Call fetchUserInfo function when component mounts
    fetchUserInfo();

    // Dependency array is empty, so this effect runs only once when the component mounts
  }, []);
  const handleButton = () => {
    setIsOpen(true);
    setIsNavOpen(true);
    console.log(userInfo.photo);
  };

  const handleButton2 = () => {
    setIsOpen(false);
    setIsNavOpen(false);
  };

  const bgContentClass = isOpen ? "mt-5" : "bg-white";

  const bgMargin = isOpen ? "mt-5" : "mt-0";

  const bgMargin2 = isOpen ? "mt-2" : "mt-0";
  return (
    <div className=" font-poppins">
      <div className="w-full bg-white visible xsm:visible sxl:hidden xl:hidden xsm:fixed border h-[50px] flex justify-between px-[20px] py-[10px]">
        <div className="visible xsm:visible sxl:hidden xl:hidden  ">
          {" "}
          {/* Ensure the sidebar and button don't affect the main layout */}
          {!isOpen && (
            <button onClick={handleButton} className="bg-white fixed z-30">
              <Menu size="30" /> {/* Replaced <text> with <span> */}
            </button>
          )}
          <div
            className={`fixed z-20 duration-300 left-0 top-0 h-screen bg-white transition-all border rounded-lg ${
              isOpen ? "w-[285px]" : "w-0"
            }`} // Use Tailwind's width utilities for animation
          >
            <div className="flex justify-center ">
              <div className="flex items-center space-x-3 mx-5 h-20 mt-5">
                {isOpen && (
                  <div className="">
                    <div className="flex justify-center items-center rounded-full bg-white h-[45px] w-[45px]">
                      <img
                        src={userInfo.photo}
                        alt="User"
                        className="rounded-full h-[45px] w-[45px]"
                      />
                    </div>
                  </div>
                )}

                {isOpen && (
                  <div className=" w-[168px] flex flex-col h-fit">
                    <span className="text-sm font-semibold text-gray-400">
                      {userInfo.name}
                    </span>
                    <span className="text-sm font-semibold text-blueNav">
                      Personal
                    </span>
                  </div>
                )}

                {isOpen && (
                  <div>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setIsNavOpen(false);
                      }}
                    >
                      <ArrowLeft color="black" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="overflow-hidden w-[285px]">
              {" "}
              {/* Prevents content from spilling out */}
              <div className="flex flex-col space-y-8 p-5">
                {" "}
                {/* Added padding and flex-column layout */}
                {isOpen && (
                  <div>
                    <div className="bg-black h-px my-2 opacity-40">
                      {" "}
                      {/* Use height for horizontal lines */}
                      <span className="text-white">halo</span>{" "}
                      {/* This might not be visible */}
                    </div>
                    <div className="mb-2 mt-5">
                      <text className="text-md text-blackNav opacity-70">
                        FEATURES
                      </text>
                    </div>
                    <div className="">
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
                            />
                            <text
                              className={`${
                                isHome ? "font-bold text-blueNav" : " font-medium text-blackNav opacity-70"
                              } `}
                            >
                              Ethan
                            </text>
                          </div>
                        </Link>
                      </div>
                      <div
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
                            <text
                              className={`${
                                isCalendar ? "font-bold text-blueNav" : " font-medium text-blackNav opacity-70"
                              } `}
                            >
                              Calendar
                            </text>
                          </div>
                        </Link>
                      </div>
                      <div
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
                            />
                            {/* <CalendarDays size="30" color="#1A5967" />{" "} */}
                            <text
                              className={`${
                                isCalendar ? "font-bold text-blueNav" : " font-medium text-blackNav opacity-70"
                              } `}
                            >
                              For professionals
                            </text>
                          </div>
                        </Link>
                      </div>
                      <div className="bg-black opacity-30 w-full h-[1px] mt-8">
                        <text className="text-white">halo</text>
                      </div>
                    </div>
                    <div>
                      <div className="mt-5">
                        <text className="text-md text-blackNav opacity-70">
                          OTHERS
                        </text>
                      </div>
                      <div
                        className={`p-3 flex items-center mt-2 ${
                          isInstruction ? "bg-slate-100" : "bg-white"
                        }`}
                      >
                        <Link
                          to={{ pathname: "/documentation" }}
                          className="flex flex-row space-x-5 items-center"
                        >
                          <div className="flex flex-row items-center justify-between w-full space-x-5 ">
                            <StickyNote size="30" color="#1A5967" />{" "}
                            <text
                              className={`${
                                isInstruction ? "font-bold text-blueNav" : " font-medium text-blackNav opacity-70"
                              } `}
                            >
                              Instructions
                            </text>
                          </div>
                        </Link>
                      </div>
                      <div
                        className={`p-3 flex items-center mt-2 ${
                          isInstruction ? "bg-slate-100" : "bg-white"
                        }`}
                      >
                        <Link
                          to={{ pathname: "/documentation" }}
                          className="flex flex-row space-x-5 items-center"
                        >
                          <div className="flex flex-row items-center justify-between w-full space-x-5 ">
                          <img
                              src="setting.svg"
                              className={`h-[30px] w-[30px] ${
                                isInstruction ? "opacity-100" : "opacity-80"
                              } `}
                            />
                            <text
                              className={`${
                                isInstruction ? "font-bold text-blueNav" : " font-medium text-blackNav opacity-70"
                              } `}
                            >
                              Settings
                            </text>
                          </div>
                        </Link>
                      </div>
                      <div
                        className={`p-3 flex items-center mt-2 ${
                          isInstruction ? "bg-slate-100" : "bg-white"
                        }`}
                      >
                        <Link
                          to={{ pathname: "/documentation" }}
                          className="flex flex-row space-x-5 items-center"
                        >
                          <div className="flex flex-row items-center justify-between w-full space-x-5 ">
                          <img
                              src="chat.svg"
                              className={`h-[30px] w-[30px] ${
                                isInstruction ? "opacity-100" : "opacity-80"
                              } `}
                            />
                            <text
                              className={`${
                                isInstruction ? "font-bold text-blueNav" : " font-medium text-blackNav opacity-70"
                              } `}
                            >
                              Feedback
                            </text>
                          </div>
                        </Link>
                      </div>
                      <div
                        className={`p-3 flex items-center mt-2 ${
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
                                isInstruction ? "font-bold text-blueNav" : " font-medium text-blackNav opacity-70"
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
        className={`duration-300  visible  xsm:hidden xl:block sxl:block h-full text-black ${
          isOpen ? "w-[285px]" : "w-[70px]"
        } transition-width border rounded-lg`}
        onMouseEnter={handleButton}
        onMouseLeave={handleButton2}
      >
        <div className="flex justify-center">
          <div className="flex items-center space-x-5 h-20 mt-5">
            <div className="">
              <div className="flex justify-center items-center rounded-full  h-[45px] w-[45px]">
                <img
                  src={userInfo.photo}
                  alt="User"
                  className="rounded-full h-[45px] w-[45px]"
                />
              </div>
            </div>

            {isOpen && (
              <div className=" w-[168px] flex flex-col h-fit">
                <span className="text-sm font-semibold text-gray-400">
                  {userInfo.name}
                </span>
                <span className="text-sm font-semibold text-blueNav">
                  Personal
                </span>
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

        <div className="flex justify-center">
          <div className=" w-[250px] flex justify-center items-center">
            <nav className=" flex w-fit justify-center">
              <ul className="">
                <div className="mt-5">
                  {isOpen && (
                    <div>
                      <text className="text-md text-blackNav opacity-70">
                        FEATURES
                      </text>
                    </div>
                  )}
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
                        <img src="ethan.svg" className={`h-[30px] w-[30px] ${
                              isHome ? "opacity-100" : "opacity-80"
                            } `} />
                      </li>
                      {isOpen && (
                        <div className=" ">
                          <text
                            className={`${
                              isHome ? "font-bold text-blueNav" : " font-medium text-blackNav opacity-70"
                            }`}
                          >
                            Ethan
                          </text>
                        </div>
                      )}
                    </Link>
                  </div>
                  <div
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
                        <img src="calendar.svg" className={`h-[30px] w-[30px] ${
                              isCalendar ? "opacity-100" : "opacity-80"
                            } `} />
                      </li>
                      {isOpen && (
                        <div className=" ">
                          <text
                            className={`${
                              isCalendar ? "font-bold text-blueNav" : " font-medium text-blackNav opacity-70"
                            } `}
                          >
                            Calendar
                          </text>
                        </div>
                      )}
                    </Link>
                  </div>
                  <div
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
                              isCalendar ? "font-bold text-blueNav" : " font-medium text-blackNav opacity-70"
                            } `}
                          >
                            For professionals
                          </text>
                        </div>
                      )}
                    </Link>
                  </div>

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
                    {isOpen && (
                      <div className="bg-black opacity-40 w-[238px] h-[1px] mt-8">
                        <text className="text-white">halo</text>
                      </div>
                    )}
                  </div>
                  <div>
                    {isOpen && (
                      <div className={`text-titleNav ${bgMargin} `}>
                        <text className="text-md  text-blackNav opacity-70">
                          OTHERS
                        </text>
                      </div>
                    )}
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
                          <StickyNote size="30" color="#1A5967" />{" "}
                        </li>
                        {isOpen && (
                          <div className="flex flex-row items-center justify-between  w-[118px] ">
                            <text
                              className={`${
                                isInstruction ? "font-bold text-blueNav" : " font-medium text-blackNav opacity-70"
                              }`}
                            >
                              Instructions
                            </text>
                          </div>
                        )}
                      </Link>
                    </div>
                    <div
                      className={`${bgMargin2} ${
                        isInstruction ? "bg-slate-100" : "bg-white"
                      } p-3 flex items-center rounded-lg `}
                    >
                      <Link
                        to={{ pathname: "/" }}
                        className="flex flex-row space-x-5 items-center"
                      >
                        <li>
                          {" "}
                          <img
                            src="setting.svg"
                            className={`h-[30px] w-[30px] ${
                              isInstruction ? "opacity-100" : "opacity-80"
                            } `}
                          />
                        </li>
                        {isOpen && (
                          <div className="flex flex-row items-center justify-between  w-[118px] ">
                            <text
                              className={`${
                                isInstruction ? "font-bold text-blueNav" : " font-medium text-blackNav opacity-70"
                              } `}
                            >
                              Settings
                            </text>
                          </div>
                        )}
                      </Link>
                    </div>
                    <div
                      className={`${bgMargin2} ${
                        isInstruction ? "bg-slate-100" : "bg-white"
                      } p-3 flex items-center rounded-lg `}
                    >
                      <Link
                        to={{ pathname: "/" }}
                        className="flex flex-row space-x-5 items-center"
                      >
                        <li>
                          {" "}
                          <img src="chat.svg" className={`h-[30px] w-[30px] ${
                              isInstruction ? "opacity-100" : "opacity-80"
                            } `} />
                        </li>
                        {isOpen && (
                          <div className="flex flex-row items-center justify-between  w-[118px] ">
                            <text
                              className={`${
                                isInstruction ? "font-bold text-blueNav" : " font-medium text-blackNav opacity-70"
                              } text-blueNav`}
                            >
                              Feedback
                            </text>
                          </div>
                        )}
                      </Link>
                    </div>
                    <div
                      className={`${bgMargin2} ${
                        isInstruction ? "bg-slate-100" : "bg-white"
                      } p-3 flex items-center rounded-lg `}
                    >
                      <Link
                        to={{ pathname: "/" }}
                        className="flex flex-row space-x-5 items-center"
                      >
                        <li>
                          {" "}
                          <img src="square.svg" className={`h-[30px] w-[30px] ${
                              isInstruction ? "opacity-100" : "opacity-80"
                            } `} />
                        </li>
                        {isOpen && (
                          <div className="flex flex-row items-center justify-between  w-[118px] ">
                            <text
                              className={`${
                                isInstruction ? "font-bold text-blueNav" : " font-medium text-blackNav opacity-70"
                              } text-blueNav`}
                            >
                              Help
                            </text>
                          </div>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
