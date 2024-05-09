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
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

export default function NavBar({ setIsNavOpen, setIsAgent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", photo: "" });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data } = await axios.get(
          /*process.env.REACT_APP_USER_INFO ||*/ "http://localhost:3001/user-info",
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
  };

  const handleButton2 = () => {
    setIsOpen(false);
    setIsNavOpen(false);
  };
  return (
    <div className="">
      <div className="w-full bg-white visible xsm:visible sxl:hidden xl:hidden  border h-[50px] flex justify-between px-[20px] py-[10px]">
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
              <div className="flex items-center space-x-3 mx-5 h-20  mt-5">
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
                  <div className=" w-[164px] flex flex-col h-fit">
                    <span className="text-md font-semibold">Student</span>
                    <span className="text-sm font-medium">{userInfo.name}</span>
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
                    <div className="flex justify-between items-center mb-4">
                      {" "}
                      {/* Better control of spacing */}
                      <span className="font-semibold">Assistant</span>
                    </div>

                    <button className="flex items-center space-x-5 my-8">
                      <Bot size="31" color="black" />
                      <span className="font-medium">Ethan</span>
                    </button>

                    <div className="bg-black h-px my-2">
                      {" "}
                      {/* Use height for horizontal lines */}
                      <span className="text-white">halo</span>{" "}
                      {/* This might not be visible */}
                    </div>
                    <div className="my-8">
                      <text className=" font-semibold">Features</text>
                    </div>
                    <div className="space-y-8">
                      <Link
                        to={{ pathname: "/home" }}
                        className="flex flex-row space-x-5 items-center"
                      >
                        <div className="flex flex-row items-center justify-between w-[100px] ">
                          <Home size="30" color="black" />{" "}
                          <text className=" font-medium">Home</text>
                        </div>
                      </Link>
                      <Link
                        to={{ pathname: "/calendar" }}
                        className="flex flex-row space-x-5 items-center"
                      >
                        <div className="flex flex-row items-center justify-between w-[123px] ">
                          <CalendarDays size="30" color="black" />{" "}
                          <text className=" font-medium">Calendar</text>
                        </div>
                      </Link>
                      <div className="bg-black w-full h-[1px]">
                        <text className="text-white">halo</text>
                      </div>
                    </div>

                    <div className="my-8">
                      <text className=" font-semibold">Settings</text>
                    </div>
                    <Link
                      to={{ pathname: "/calendar" }}
                      className="flex flex-row space-x-5 items-center"
                    >
                      <div className="flex flex-row items-center justify-between w-[118px] ">
                        <Settings size="30" color="black" />{" "}
                        <text className=" font-medium">Settings</text>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div>
          <img src="logo.jpeg" className="h-[33px]" />
        </div>
      </div>

      {/* <div
          className="fixed z-20 duration-300 left-0 top-0 h-screen bg-white transition-width border rounded-lg"
          style={{ width: isOpen ? "285px" : "0px" }}
        >
          <div className="flex p-[20px]">
          <div className=" w-[250px]">
            <div className=" flex w-fit">
              <ul className="space-y-8">
                <div className="w-[243px]">
                  {isOpen && 
                  <div className="flex flex-row justify-between">
                    <text className="font-semibold">Assistant</text>
                    <button onClick={handleButton2}>
                      <ArrowLeft />
                    </button>
                    
                  </div>
                  
                  }

                  <button className="flex flex-row space-x-5 items-center my-8">
                    
                    {isOpen && (
                      
                      <div className="">
                        <li>
                      {" "}
                      <Bot size="31" color="black" />{" "}
                    </li>
                        <text className=" font-medium">Ethan</text>
                      </div>
                    )}
                  </button>

                  {isOpen && (
                    <div className="bg-black w-full h-[1px]">
                      <text className="text-white">halo</text>
                    </div>
                  )}
                </div>

                <div className="space-y-8 ">
                  {isOpen && <text className=" font-semibold">Features</text>}
                  <Link
                    to={{ pathname: "/home" }}
                    className="flex flex-row space-x-5 items-center"
                  >
                    
                    {isOpen && (
                      <div className=" ">
                        <li>
                      {" "}
                      <Home size="30" color="black" />{" "}
                    </li>
                        <text className=" font-medium">Home</text>
                      </div>
                    )}
                  </Link>
                  <Link
                    to={{ pathname: "/calendar" }}
                    className="flex flex-row space-x-5 items-center"
                  >
                    
                    {isOpen && (
                      <div className=" ">
                        <li>
                      {" "}
                      <CalendarDays size="30" color="black" />{" "}
                    </li>
                        <text className=" font-medium">Calendar</text>
                      </div>
                    )}
                  </Link>
                  <Link
                    to={{ pathname: "/todo" }}
                    className="flex flex-row space-x-5 items-center"
                  >
                    
                    {isOpen && (
                      <div className="w-[72px]">
                        <li>
                      {" "}
                      <LayoutList size="30" color="black" />{" "}
                    </li>
                        <text className=" font-medium">To do List</text>
                      </div>
                    )}
                  </Link>
                  <Link
                    to={{ pathname: "/meeting" }}
                    className="flex flex-row space-x-5 items-center"
                  >
                    
                    {isOpen && (
                      <div className="">
                        <li>
                      {" "}
                      <Users size="30" color="black" />{" "}
                    </li>

                        <text className=" font-medium">Meetings</text>
                      </div>
                    )}
                  </Link>
                  <div>
                    <Link
                      to={{ pathname: "/routemap" }}
                      className="flex flex-row space-x-5 items-center"
                    >
                      
                      {isOpen && (
                        <div className="">
                          <li>
                        {" "}
                        <Map size="30" color="black" />{" "}
                      </li>
                          <text className="font-medium">Map</text>
                        </div>
                      )}
                    </Link>
                    {isOpen && (
                      <div className="bg-black w-full h-[1px] mt-8">
                        <text className="text-white">halo</text>
                      </div>
                    )}
                  </div>
                  <div>
                    {isOpen && <text className=" font-semibold">Settings</text>}
                    <button className="flex flex-row space-x-5 items-center my-8">
                      
                      {isOpen && (
                        <div className=" ">
                          <li>
                        {" "}
                        <Settings size="30" color="black" />{" "}
                      </li>
                          <text className=" font-medium">Settings</text>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </ul>
            </div>
          </div>
        </div>

        </div>  */}

      <div
        className={`duration-300 visible xsm:hidden xl:block sxl:block  h-screen text-black bg-slate-50 ${
          isOpen ? "w-[285px]" : "w-[70px]"
        } transition-width border rounded-lg`}
      >
        <div className="flex justify-center ">
          <div className="flex items-center space-x-3 mx-5 h-20  mt-5">
            <div className="">
              <div className="flex justify-center items-center rounded-full bg-slate-100 h-[45px] w-[45px]">
                <img
                  src={userInfo.photo}
                  alt="User"
                  className="rounded-full h-[45px] w-[45px]"
                />
              </div>
            </div>

            {isOpen && (
              <div className=" w-[164px] flex flex-col h-fit">
                <span className="text-md font-semibold">Student</span>
                <span className="text-sm font-medium">{userInfo.name}</span>
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
        {isOpen && (
          <div className="px-[20px]">
            {" "}
            <div className="bg-black w-full h-[1px] mt-5 "></div>
          </div>
        )}

        <div className="flex p-[20px]">
          <div className=" w-[250px]">
            <nav className=" flex w-fit">
              <ul className="space-y-8">
                <div>
                  {!isOpen && (
                    <div>
                      <button onClick={handleButton}>
                        <ArrowRight color="black" size="30" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="w-[243px]">
                  {isOpen && <text className="font-semibold">Assistant</text>}

                  <button className="flex flex-row space-x-5 items-center my-8">
                    <li>
                      {" "}
                      <Bot size="31" color="black" />{" "}
                    </li>
                    {isOpen && (
                      <div className="">
                        <text className=" font-medium">Ethan</text>
                      </div>
                    )}
                  </button>

                  {isOpen && (
                    <div className="bg-black w-full h-[1px]">
                      <text className="text-white">halo</text>
                    </div>
                  )}
                </div>

                <div className="space-y-8 ">
                  {isOpen && <text className=" font-semibold">Features</text>}
                  <Link
                    to={{ pathname: "/home" }}
                    className="flex flex-row space-x-5 items-center"
                  >
                    <li>
                      {" "}
                      <Home size="30" color="black" />{" "}
                    </li>
                    {isOpen && (
                      <div className=" ">
                        <text className=" font-medium">Home</text>
                      </div>
                    )}
                  </Link>
                  <Link
                    to={{ pathname: "/calendar" }}
                    className="flex flex-row space-x-5 items-center"
                  >
                    <li>
                      {" "}
                      <CalendarDays size="30" color="black" />{" "}
                    </li>
                    {isOpen && (
                      <div className=" ">
                        <text className=" font-medium">Calendar</text>
                      </div>
                    )}
                  </Link>
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
                      <div className="bg-black w-full h-[1px] mt-8">
                        <text className="text-white">halo</text>
                      </div>
                    )}
                  </div>
                  <div>
                    {isOpen && <text className=" font-semibold">Settings</text>}
                    <button className="flex flex-row space-x-5 items-center my-8">
                      <li>
                        {" "}
                        <Settings size="30" color="black" />{" "}
                      </li>
                      {isOpen && (
                        <div className=" ">
                          <text className=" font-medium">Settings</text>
                        </div>
                      )}
                    </button>
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
