import {
  
  CalendarDays,
  LayoutList,
  Users,
  Map,
  Bot,
  Settings,
  ArrowRight,
  ArrowLeft,
  Home
} from "lucide-react";
import gans from "./images/Evan.jpg";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function NavBar( { setIsNavOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', photo: '' });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/user-info', { withCredentials: true });
        console.log(data.photo)
        setUserInfo({ name: data.name, photo: data.photo });
        console.log("hello")
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleButton = () => {
    setIsOpen(true)
    setIsNavOpen(true)
  }
  return (
    <div className="">
      <div
        className={`duration-300 h-full text-black bg-white ${
          isOpen ? "w-[285px]" : "w-[70px]" 
        } transition-width border rounded-lg`}
      >
        <div className="flex justify-center  ">
          <div className="flex items-center space-x-3 mx-5 h-20  mt-5">
            <div className="">
              <div className="flex justify-center items-center rounded-full bg-white h-[45px] w-[45px]">
                <img src={userInfo.photo} alt="User" className="rounded-full h-[45px] w-[45px]" />
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
                <button onClick={() => {
                  setIsOpen(false)
                  setIsNavOpen(false)
                }}>
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
                  {isOpen && (
                    <text className="font-semibold">Assistant</text>
                  )}

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
                  {isOpen && (
                    <text className=" font-semibold">Features</text>
                  )}
                  <Link to={{ pathname: "/home"}} className="flex flex-row space-x-5 items-center">
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
                  <Link to={{ pathname: "/calendar"}} className="flex flex-row space-x-5 items-center">
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
                  <Link to={{ pathname: "/todo"}} className="flex flex-row space-x-5 items-center">
                    <li>
                      {" "}
                      <LayoutList size="30" color="black" />{" "}
                    </li>
                    {isOpen && (
                      <div className="w-[72px]">
                        <text className=" font-medium">
                          To do List
                        </text>
                      </div>
                    )}
                  </Link>
                  <Link to={{ pathname: "/meeting"}} className="flex flex-row space-x-5 items-center">
                    <li>
                      {" "}
                      <Users size="30" color="black" />{" "}
                    </li>

                    {isOpen && (
                      <div className="">
                        <text className=" font-medium">Meetings</text>
                      </div>
                    )}
                  </Link>
                  <div>
                  <Link to={{ pathname: "/routemap"}}className="flex flex-row space-x-5 items-center">
                      <li>
                        {" "}
                        <Map size="30" color="black" />{" "}
                      </li>
                      {isOpen && (
                        <div className="">
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
                    {isOpen && (
                      <text className=" font-semibold">Settings</text>
                    )}
                    <button className="flex flex-row space-x-5 items-center my-8">
                      <li>
                        {" "}
                        <Settings size="30" color="black" />{" "}
                      </li>
                      {isOpen && (
                        <div className=" ">
                          <text className=" font-medium">
                            Settings
                          </text>
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
