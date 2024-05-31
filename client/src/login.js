import { Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
  const handleLogin = () => {
    const loginUrl =
      process.env.REACT_APP_LOGIN_URL /*|| "http://localhost:3001/login"*/;
    window.location.href = loginUrl;
  };
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="flex flex-col justify-center h-fit rounded-lg bg-white w-[550px] p-5 text-black">
        <div className="flex flex-col justify-center items-center ">
          <div>
            <img
              src="logo.jpeg"
              alt="logo"
              className="rounded-full h-[180px] w-[180px] "
            />
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="mb-2 text-center">
              <text className="text-4xl font-medium text-center">
                Your very own digital secretary
              </text>
            </div>
            <text>Sign up with google only. For now.</text>
          </div>
        </div>
        <div className="w-full">
          <button
            className="bg-white border w-full mt-3 rounded-full h-[50px]"
            onClick={handleLogin}
          >
            <div className="flex flex-row items-center justify-center space-x-2">
                <img src="googlelogo.jpg" className="h-[25px] w-[25px]" alt="google"/>
                <div className="">
                    <text>Sign in with Google</text>
                </div>
            </div>
          </button>
          <button
            className="bg-blueNav border w-full mt-3 rounded-full h-[50px]"
            onClick={handleLogin}
          >
            <div className="flex flex-row items-center justify-center space-x-2">
                <Users color="white"/>
                <div className="">
                    <text className="text-white">Get ethan for professional</text>
                </div>
            </div>
          </button>
          <div className=" flex justify-center items-center flex-col mt-3">
            <div className="flex xsm:flex-col sxl:flex-row text-center">
                <text>
                    By continuing, you agree to the 
                </text>
                <text className="ml-1 underline">
                    Terms of Service
                </text>
            </div>
            <div className="flex xsm:flex-col sxl:flex-row text-center mt-1">
                <text>
                    and acknowledge you've read our 
                </text>
                <Link><text className="ml-1 underline">
                    Privacy Policy
                </text></Link>
                
            </div>
            <div className="mt-8">
                <text>
                    Been here before? 
                </text>
                <text className="ml-1 underline">
                    Log in
                </text>
            </div>
            
           
        </div>
        </div>
       
      </div>
    </div>
  );
}

