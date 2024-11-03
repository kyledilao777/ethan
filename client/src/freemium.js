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
        <div className="w-full space-y-8">
          <div className="text-center text-3xl font-extrabold">
            Take your pick 
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="max-w-sm w-full bg-white rounded-lg shadow-md p-8 border border-gray-200">
              <h3 className="text-blueNav font-bold text-xl mb-2">Ethan</h3>
              <p className="font-medium text-2xl mb-4">Free</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create and change your schedules using natural language</li>
                <li>Generate a Google Meets link</li>
                <li>Send an email invite to your friends</li>
                <li>Add descriptions to each event in your planner</li>
                <li>Schedule across timezones</li>
              </ul>
              <button
                onClick={() => setTier("free")}
                className="mt-5 w-full border-2 hover:scale-105 transition-transform duration-300 ease-in-out border-blueNav text-blueNav rounded-md py-3"
              >
                Start for Free
              </button>
            </div>
            <div className="max-w-sm w-full bg-white rounded-lg shadow-md p-8 border border-gray-200">
              <h3 className="text-blueNav font-bold text-xl mb-2">Ethan+</h3>
              <p className="font-medium text-2xl mb-4">US$10/month*</p>
              <p className="font-medium text-lg mb-1">
                Everything in Ethan, plus:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Enhanced query understanding with more advanced models</li>
                <li>
                  Train Ethan to understand your preferred timings and
                  activities
                </li>
                <li>Create your own contact list</li>
              </ul>
              <button
                onClick={() => {     
                  alert("Please remember to open main.untangled-ai.com again after payment.");
                  window.location.href = "https://buy.stripe.com/14kdRO6zVcWpeGI4gh"; }}
                className="mt-12 w-full border-2 border-blueNav hover:scale-105 transition-transform duration-300 ease-in-out rounded-md text-white bg-blueNav py-3"
              >
                Get Premium
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
