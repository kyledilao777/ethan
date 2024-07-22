import { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "./components/navbar";
import { setIsAgent, setAgentResponse } from "./redux/reducers/agentReducer";
import { setData } from "./redux/reducers/userReducer";
import AccordionItem from "./components/AccordionItem"; // Import the new AccordionItem component
import ReactGA from "react-ga"

export default function Documentation() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [openItem, setOpenItem] = useState(null);

  const mainContentClass = isNavOpen ? "xsm:ml-[300px] sxl:ml-[0px]" : "";

  const handleToggle = (id) => {
    
      ReactGA.event({
        category: 'User',
        action: 'Toggles',
        label: 'User Toggles'
      });
    
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="w-full h-full">
      <div className="w-full flex sxl:flex-row xsm:flex-col h-screen">
        <NavBar
          setIsNavOpen={setIsNavOpen}
          isInstruction={true}
          setIsAgent={setIsAgent}
          setAgentResponse={setAgentResponse}
          setData={setData}
        />
        <div
          className={`flex flex-col w-full p-10 justify-between h-full transition-all duration-300 ${mainContentClass}`}
        >
          <div className={`w-full sxl:mt-0 xsm:mt-10`}>
            <div>
              <h1 className="xsm:text-2xl sxl:text-3xl font-bold">
                Frequently Asked Questions (FAQ)
              </h1>
            </div>
            <div className="xsm:w-5/6 mt-7 sxl:w-4/5 space-y-5">
              <AccordionItem
                id="item1"
                title="What is Ethan?"
                isOpen={openItem === "item1"}
                onToggle={handleToggle}
              >
                <p>
                  Ethan is an AI Assistant that helps you manage your schedule
                  by integrating with Google Calendar. With Ethan, you can
                  easily organize your events, meetings, and appointments using
                  natural language. You can also schedule meetings across
                  timezones, attach links and notes.
                </p>
              </AccordionItem>
              <AccordionItem
                id="item2"
                title="How do I create an event?"
                isOpen={openItem === "item2"}
                onToggle={handleToggle}
              >
                <p>
                  You can start by simply saying "Hi Ethan, create a meeting
                  tomorrow at 2pm". Ethan will then ask you for the event title,
                  location, and description. Once you provide the necessary
                  information, Ethan will create the event for you.
                </p>
              </AccordionItem>
              <AccordionItem
                id="item3"
                title="Can I invite someone for a meeting?"
                isOpen={openItem === "item3"}
                onToggle={handleToggle}
              >
                <p>Of course! Just include his/her email in your message.</p>
              </AccordionItem>
              <AccordionItem
                id="item4"
                title="Can I ask Ethan to remember an email/contact for me?"
                isOpen={openItem === "item4"}
                onToggle={handleToggle}
              >
                <p>
                  Currently, Ethan does not support contact/mailing list. This
                  feature is currently in development and will be available on
                  Ethan+.
                </p>
              </AccordionItem>
              <AccordionItem
                id="item5"
                title="I don't use Google Calendar. Can I still use Ethan?"
                isOpen={openItem === "item5"}
                onToggle={handleToggle}
              >
                <p>While Ethan only supports Google Calendar today, we are looking to integrate more calendars in the future so do stay tuned. As a workaround, Google allows users to connect their calendars to non-Google calendars such as iCal or Outlook.</p>
              </AccordionItem>
              <AccordionItem
                id="item6"
                title="Is Ethan 100% reliable?"
                isOpen={openItem === "item6"}
                onToggle={handleToggle}
              >
                <p>
                  Ethan is still in the Beta Development phase, please be
                  patient if you encounter some bugs with Ethan. Even so, 100%
                  is always hard to achieve :")
                </p>
              </AccordionItem>
              <AccordionItem
                id="item7"
                title="How can I give feedback?"
                isOpen={openItem === "item7"}
                onToggle={handleToggle}
              >
                <p>
                  You can give us feedback by submitting a form on our website{" "}
                  <a
                    href="https://untangled-ai.carrd.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    here
                  </a>{" "}
                  or by visiting our LinkedIn page{" "}
                  <a
                    href="https://www.linkedin.com/company/untangled-ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    here
                  </a>
                  .
                </p>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
