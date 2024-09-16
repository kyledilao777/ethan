import { useState } from "react";
import axios from "axios";

export default function Freemium() {
  const [tier, setTier] = useState("");
  const sendData = async () => {
    
    try {
      const res = await axios.post(
        "http://localhost:3001/update-freemium",
        {
          tier: tier
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Include this in the same object as headers
        }
      );
      console.log(res.data.message);
      
    } catch (error) {
      console.error("Error updating user profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="h-screen w-full">
      <div>
        <text>Subscription!</text>
        <div>
          <button onClick={sendData()}>Free</button>
        </div>
        <div>
          <button onClick={() => {
            setTier("premium")
            sendData()
          }}>Premium</button>
        </div>
      </div>
    </div>
  );
}
