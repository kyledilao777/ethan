import {
  Menu,
  CalendarDays,
  LayoutList,
  Users,
  Map,
  Bot,
  Settings,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import gans from "./images/Evan.jpg";
import { useState } from "react";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="">
      <div
        className={`duration-300 h-screen text-black bg-white ${
          isOpen ? "w-[285px]" : "w-[70px]" 
        } transition-width`}
      >
        <div className="flex justify-center  ">
          <div className="flex items-center space-x-3 mx-5 h-20  mt-5">
            <div className="">
              <div className="flex justify-center items-center rounded-full bg-white h-[45px] w-[45px]">
                <img src={gans} className="rounded-full h-[45px] w-[45px]" />
              </div>
            </div>

            {isOpen && (
              <div className=" w-[164px] flex flex-col h-fit">
                <span className="text-md">Student</span>
                <span className="text-sm font-medium">
                  Evan Darren Christanto
                </span>
              </div>
            )}

            {isOpen && (
              <div>
                <button onClick={() => setIsOpen(false)}>
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
                      <button onClick={() => setIsOpen(true)}>
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
                  <button className="flex flex-row space-x-5 items-center">
                    <li>
                      {" "}
                      <CalendarDays size="30" color="black" />{" "}
                    </li>
                    {isOpen && (
                      <div className=" ">
                        <text className=" font-medium">Calendar</text>
                      </div>
                    )}
                  </button>
                  <button className="flex flex-row space-x-5 items-center">
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
                  </button>
                  <button className="flex flex-row space-x-5 items-center">
                    <li>
                      {" "}
                      <Users size="30" color="black" />{" "}
                    </li>

                    {isOpen && (
                      <div className="">
                        <text className=" font-medium">Meetings</text>
                      </div>
                    )}
                  </button>
                  <div>
                    <button className="flex flex-row space-x-5 items-center">
                      <li>
                        {" "}
                        <Map size="30" color="black" />{" "}
                      </li>
                      {isOpen && (
                        <div className="">
                          <text className="font-medium">Map</text>
                        </div>
                      )}
                    </button>
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
