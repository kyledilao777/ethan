import { useState, useEffect } from "react";
import axios from "axios";

export default function Freemium() {
  const [tier, setTier] = useState("");

  useEffect(() => {
    if (tier) {
      sendData(); // Only call sendData after tier has been updated
    }
  }, [tier]); // Trigger this effect when 'tier' changes

  const sendData = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3001/update-freemium",
        {
          tier: tier,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Include this in the same object as headers
        }
      );
      console.log(res.data.message);
      window.location.href = "http://localhost:3000/home?auth=success"; // Redirect to the specified URL
    } catch (error) {
      console.error("Error updating user profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="w-full h-full">
      <div className="w-full h-screen flex justify-center items-center px-10">
        <div className="w-full space-y-5">
          {" "}
          <div className="flex justify-center text-3xl font-extrabold">
            <text>Plans available!</text>
          </div>
          <div className="flex xmd:flex-row xsm:flex-col w-full xmd:space-x-3 xsm:space-y-3 xmd:space-y-0 justify-center">
            <div className="xmd:w-[450px] bg-white rounded-md flex flex-col p-4 border-gray-200 border-solid border">
              <text className="text-blueNav font-bold text-xl">Ethan</text>
              <text className="font-medium text-2xl">Free</text>
              <ul className="list-disc p-3">
                <li>Create, Retrieve, Change and Delete Events</li>
                <li>
                Attach Google Meet, Zoom Conferencing or Microsoft Teams link
                </li>
                <li>
                Invite multiple attendees
                </li>
                <li>
                Add description notes to event
                </li>
                <li>Schedule across timezones</li>
              </ul>
              <button onClick={() => setTier("free")} className="border-2 mt-3 hover:scale-105  transition-transform duration-300 ease-in-out border-blueNav text-blueNav rounded-md p-2">Try Ethan for free</button>
            </div>
            <div className="xmd:w-[450px] bg-white rounded-md flex flex-col p-4 border-gray-200 border-solid border">
              <text className="text-blueNav font-bold text-xl">Ethan+</text>
              <text className="font-medium text-2xl">US$10/month*</text>
              <ul className="list-disc p-3">
                <li>Enhanced query understanding with more advanced models</li>
                <li>
                Train Ethan to understand your preferred timings and activities
                </li>
                <li>
                Create your own contact list
                </li>
              </ul>
              <text>*billed annually. US$15/month if billed monthly</text>
              <button onClick={() => setTier("premium")} className="border-2 mt-3 border-blueNav hover:scale-105  transition-transform duration-300 ease-in-out rounded-md text-white bg-blueNav p-2">Premium Tier</button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
