import NavBar from "./components/navbar";
import { useState, useEffect } from "react";
import { Mic, CalendarDays, LayoutList, Users, Map } from "lucide-react";

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [data, setData] = useState({});
  const [userInput, setUserInput] = useState('');
  const [agentResponse, setAgentResponse] = useState(null); // State to store the agent's response

  const sendUserInput = () => {
    fetch("/agent", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_input: userInput }), // Send the user input to the backend
    })
      .then((res) => res.json())
      .then((data) => {
        setAgentResponse(data.response); // Update the state with the agent's response
      });
  };

  //   return (
  //     <div className=" w-full h-screen ">
  //       <div className="w-full flex flex-row h-screen ">
  //         <NavBar setIsNavOpen={setIsNavOpen}/>
  //         <div className="w-full flex px-[200px] items-center ">
  //           <div className="flex flex-col justify-center text-center w-full  h-fit">
  //             <div>
  //               <text className="font-bold text-2xl">
  //                 Your very own digital secretary.
  //               </text>
  //             </div>
  //             <div className="flex flex-row items-center my-10">
  //               <input
  //                 className="h-[100px] w-full  border-gray-200 border-solid border-2 pl-2 pt-2 rounded-md"
  //                 placeholder="Hi, how can I help you?"
  //               />
  //             </div>
  //             <div className="flex space-x-20 flex-row justify-center w-full">
  //               <CalendarDays size="40" />
  //               <LayoutList size="40" />
  //               <Users size="40" />
  //               <Map size="40" />
  //             </div>
  //           </div>
  //           <div className=" flex items-center">
  //             <Mic className="mx-3" size="50" />
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  return (
    <div className=" w-full h-screen ">
      <div className="w-full flex flex-row h-screen ">
        <NavBar setIsNavOpen={setIsNavOpen} />
        <div className="w-full flex px-[200px] items-center ">
          <div className="flex flex-col justify-center text-center w-full  h-fit">
            {agentResponse && <div className="mb-10 text-lg">{agentResponse}</div>} {/* Display the agent's response */}
            <div>
              <text className="font-bold text-2xl">
                Your very own digital secretary.
              </text>
            </div>
            <div className="flex flex-row items-center my-10 space-x-3">
              <input
                className="h-[60px] w-full border-gray-200 border-solid border-2 pl-2 pt-2 rounded-md"
                placeholder="Hi, how can I help you?"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendUserInput()} // Use onKeyDown to detect the Enter key press
              />
              <button
                onClick={sendUserInput} // Call sendUserInput when the button is clicked
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Enter
              </button>
            </div>
            <div className="flex space-x-20 flex-row justify-center w-full">
              <CalendarDays size="40" />
              <LayoutList size="40" />
              <Users size="40" />
              <Map size="40" />
            </div>
          </div>
          <div className=" flex items-center">
            <Mic className="mx-3" size="50" />
          </div>
        </div>
      </div>
    </div>
  );
}
