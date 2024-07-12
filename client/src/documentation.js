import NavBar from "./components/navbar";
import { useState } from "react";
import { Link } from "react-router-dom";
import { setIsAgent } from "./redux/reducers/agentReducer";
import { setAgentResponse } from "./redux/reducers/agentReducer";
import { setData } from "./redux/reducers/userReducer";

export default function Documentation() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const mainContentClass = isNavOpen
    ? "xsm:ml-[300px] sxl:ml-[0px]"
    : "";

  return (
    <div className=" w-full h-full">
      <div className="w-full flex sxl:flex-row xsm:flex-col h-screen">
      <NavBar setIsNavOpen={setIsNavOpen} isInstruction={true} setIsAgent={setIsAgent} setAgentResponse={setAgentResponse} setData={setData} />
        <div
          className={`flex flex-col w-full p-10 justify-between h-full transition-all duration-300 ${mainContentClass}`}
        >
          <div className={`w-full sxl:mt-0 xsm:mt-10 `}>
            <div className=" ">
              <text className="xsm:text-2xl sxl:text-3xl font-bold">
              Frequently Asked Questions (FAQ)
              </text>
            </div>
            <div className="xsm:w-5/6 mt-7 sxl:w-4/5 space-y-1">
              <text className="text-xl font-semibold">
                What is Ethan?
              </text>
              <p>
                Ethan is an AI Assistant, who helps organize your schedules through your google calendar integration
              </p>
            </div>
            <div className="xsm:w-5/6 mt-5 sxl:w-4/5 space-y-1">
              <text className="text-xl font-semibold">
                What Can Ethan Do?
              </text>
              <ul className="list-disc pl-5">
              <li>
                  Create an event - “Ethan, schedule me a meeting titled [title]
                  from [start date and time - end date and time]. Invite [name
                  and email] to be part of the meeting.”
                </li>
                <li>Retrieve events - “Ethan, what do I have on today?”</li>
                <li>
                  Edit events - “Ethan, postpone [event on date and time] to
                  [new date and time].”
                </li>
                <li>
                  Delete events - “Ethan, delete [event] that is scheduled on
                  [date and time].”
                </li>
              </ul>
            </div>
            <div className="xsm:w-5/6 mt-7 sxl:w-4/5 space-y-1">
              <text className="text-xl font-semibold">
                Is Ethan perfect?
              </text>
              <p>
               As Ethan is still in the Beta Development phase, please be patient if you encounter some bugs with Ethan.
              </p>
            </div>
            <div className="xsm:w-5/6 mt-7 sxl:w-4/5 space-y-1">
              <text className="text-xl font-semibold">
                Can I give a feedback? If yes, how?
              </text>
              <p>
                Yes! You can give us feedbacks through our website: https://untangled.carrd.co/
              </p>
            </div>
          </div>
          <div
            className={`flex flex-row justify-end items-center w-full  space-x-8 px-5  mt-25vh`}
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
        </div>
      </div>
    </div>
  );
}
