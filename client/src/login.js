import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";


export default function Login() {
  const handleLogin = () => {
    
    const loginUrl =
      process.env.REACT_APP_LOGIN_URL || "http://localhost:3001/login";
    window.location.href = loginUrl;
  };

  const [logoutMessage, setLogoutMessage] = useState("");

  useEffect(() => {
    // Check if there's a logout message in localStorage
    const message = localStorage.getItem("logoutMessage");

    if (message) {
      setLogoutMessage(message);
      localStorage.removeItem("logoutMessage"); // Clear the message after displaying it
    }
  }, []);

  useEffect(() => {
    const verifyAuth = async () => {
      const { data } = await axios.get(
        /*process.env
          .REACT_APP_USER_INFO ||*/ "http://localhost:3001/auth-check",
        { withCredentials: true }
      );
      if (data.isAuthenticated) {
        window.location.href = "http://localhost:3000/home";
      }
    };

    verifyAuth();
  }, []);

  return (
    <div className="w-full h-screen flex justify-center items-center flex-col">
      <div className="flex flex-col justify-center h-fit rounded-lg bg-white w-[550px] p-5 text-black shadow-lg">
        <div className="flex flex-col justify-center items-center">
          <div>
            <img
              src="logo.jpeg"
              alt="logo"
              className="rounded-full h-[180px] w-[180px]"
            />
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="mb-2 text-center">
              <span className="text-4xl font-medium text-center">
                Welcome to Ethan
              </span>
            </div>
          </div>
        </div>
        <div className="w-full">
          <button
            className="bg-white border w-full mt-3 rounded-2xl h-[50px] shadow hover:bg-gray-100 transition duration-300"
            onClick={handleLogin}
          >
            <div className="flex flex-row items-center justify-center space-x-2">
              <img
                src="googlelogo.jpg"
                className="h-[25px] w-[25px]"
                alt="google"
              />
              <span>Continue with Google</span>
            </div>
          </button>
          <div className="flex justify-center items-center flex-col mt-3">
            <div className="flex flex-wrap justify-center text-center">
              <span>By continuing, you agree to the</span>
              <Link to="/termsofservice" className="ml-1 underline">
                Terms of Service
              </Link>
              <span className="ml-1">and acknowledge you've read our</span>
              <Link to="/privacy-policy" className="ml-1 underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
      {logoutMessage && (
        <div className="text-red-500 mt-5">
         {logoutMessage}
        </div>
      )}
    </div>
  );
}
