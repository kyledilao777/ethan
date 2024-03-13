import NavBar from "./components/navbar";
import { Mic, CalendarDays, LayoutList, Users, Map } from "lucide-react";

export default function Home() {
  return (
    <div className=" w-full h-screen ">
      <div className="w-full flex flex-row h-screen ">
        <NavBar />
        <div className="w-full flex px-[200px] items-center ">
          <div className="flex flex-col justify-center text-center w-full  h-fit">
            <div>
              <text className="font-bold text-2xl">
                Your very own digital secretary.
              </text>
            </div>
            <div className="flex flex-row items-center my-10">
              <input
                className="h-[100px] w-full  border-gray-200 border-solid border-2 pl-2 pt-2 rounded-md"
                placeholder="Hi, how can I help you?"
              />
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
