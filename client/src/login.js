import { Link } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import ReactGA from "react-ga"

export default function Login() {
  const handleLogin = () => {
    ReactGA.event({
      'category': 'Test',
      'action': 'submit',
      'label': 'label'
    });
    const loginUrl =
      process.env.REACT_APP_LOGIN_URL /*|| "http://localhost:3001/login"*/;
    window.location.href = loginUrl;
  };

  useEffect(() => {
    const verifyAuth = async () => {
      const { data } = await axios.get(
        process.env.REACT_APP_AUTH_CHECK,
        { withCredentials: true }
      );
      if (data.isAuthenticated) {
        const homeUrl = process.env.REACT_APP_HOME_URL
        window.location.href = homeUrl;
      } 
    };

    verifyAuth();
  }, []);

  return (
    <div className="w-full h-screen flex justify-center items-center">
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
              <Link to="/termsandservices" className="ml-1 underline">
                Terms of Services
              </Link>
              <span className="ml-1">and acknowledge you've read our</span>
              <Link to="/privacy" className="ml-1 underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
