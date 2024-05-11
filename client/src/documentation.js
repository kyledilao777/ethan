import NavBar from "./components/navbar";
import { useState } from "react";

export default function Documentation() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className=" w-full h-screen ">
      <div className="w-full flex sxl:flex-row xsm:flex-col h-screen">
        <NavBar setIsNavOpen={setIsNavOpen} />
        <div className="w-full m-10 sxl:mt-11 xsm:mt-20 ">
          <div className=" ">
            <text className="xsm:text-2xl sxl:text-3xl font-bold">
              How does Ethan work?
            </text>
          </div>
          <div className="xsm:w-5/6 mt-7 text-xl font-semibold opacity-70 sxl:w-4/5">
            <text>
              Ethan is an AI assistant that helps students, freelancers and
              entrepreneurs plan their schedules and set up meetings through a
              chat-like interface.
            </text>
          </div>
          <div className="my-4 text-xl font-semibold"><text className="underline">Suggested Prompts</text></div>
          <div className="xsm:w-5/6 text-xl font-semibold opacity-70 sxl:w-full">
            <ul className="space-y-4">
              <li>
                Create an event - “Ethan, schedule me a meeting titled [title]
                from [start date and time - end date and time]. Invite [name and
                email] to be part of the meeting.”
              </li>
              <li>
                Retrieve events - “Ethan, what do I have on today?” Edit events
                - “Ethan, postpone [event on date and time] to [new date and
                time].”
              </li>
              <li>
                Delete events - “Ethan, delete [event] that is scheduled on
                [date and time].”
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}