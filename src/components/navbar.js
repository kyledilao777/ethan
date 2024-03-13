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

import { useState } from "react";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex">
    <div className={`duration-300 h-screen bg-black ${isOpen ? "w-[300px]" : "w-[100px]"} transition-width`}>
      <div className="flex justify-center ">
        <div className="flex items-center space-x-3 mx-5 h-20">
          <div className="bg-slate-400">
            <div className="flex justify-center rounded-full bg-white h-[40px] w-[40px]">
              <button className="">
                <Menu />
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="text-white bg-slate-600 flex flex-col h-[50px] whitespace-nowrap overflow-x-auto">
              <span>Student</span>
              <span>Lao Kyle Daniel Kin</span>
            </div>
          )}
          {!isOpen && (
            <div>
              <button onClick={() => setIsOpen(true)}>
                <ArrowRight color="white" />
              </button>
            </div>
          )}

          {isOpen && (
            <div>
              <button onClick={() => setIsOpen(false)}>
                <ArrowLeft color="white" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center ">
        <nav className="h-screen flex w-fit space-y-5">
          <ul className="space-y-5">
            <button className="flex flex-row space-x-8 my-10 items-center ">
              <li>
                {" "}
                <Bot size="30" color="white" />{" "}
              </li>
              {isOpen && (
                <div className="">
                  <text className="text-white">Robot</text>
                </div>
              )}
            </button>
            <div className="space-y-5 my-10 ">
              <button className="flex flex-row space-x-8 items-center">
                <li>
                  {" "}
                  <CalendarDays size="30" color="white" />{" "}
                </li>
                {isOpen && (
                  <div className="">
                    <text className="text-white">Calendar</text>
                  </div>
                )}
              </button>
              <button className="flex flex-row space-x-8 items-center">
                <li>
                  {" "}
                  <LayoutList size="30" color="white" />{" "}
                </li>
                {isOpen && (
                  <div className="">
                    <text className="text-white">To do List</text>
                  </div>
                )}
              </button>
              <button className="flex flex-row space-x-8 items-center">
                <li>
                  {" "}
                  <Users size="30" color="white" />{" "}
                </li>

                {isOpen && (
                  <div className="">
                    <text className="text-white">Meetings</text>
                  </div>
                )}
              </button>
              <button className="flex flex-row space-x-8 items-center">
                <li>
                  {" "}
                  <Map size="30" color="white" />{" "}
                </li>
                {isOpen && (
                  <div className="">
                    <text className="text-white">Map</text>
                  </div>
                )}
              </button>
            </div>
          </ul>
        </nav>
      </div>
    </div>
    </div>
    
  );
}
