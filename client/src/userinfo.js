import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function UserInfo() {
  const [name, setName] = useState("");
  const [isName, setIsName] = useState(true);
  const [isPhoto, setIsPhoto] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");

  const handleNameNext = () => {
    setIsName(false);
    setIsPhoto(true);
  };

  const [imageSrc, setImageSrc] = useState("logo.jpeg"); // You can place a default avatar URL or keep it empty

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.substr(0, 5) === "image") {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setFileName(file ? file.name : "No file chosen");
      };
      reader.readAsDataURL(file);
    } else {
      setImageSrc("logo.jpeg"); // Reset to default or handle error
    }
  };

  const sendData = async () => {
    console.log("sendData is called");
    const res = await axios.post(
      "http://localhost:3001/update-profile",
      { name: name, imageSrc: imageSrc },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // Include this in the same object as headers
      }
    );
    console.log(res.data.message);
  };

  return (
    <div className="w-full h-full ">
      <div className="w-full h-screen flex flex-col">
        <div className="w-full h-full flex items-center justify-center">
          {isName && (
            <div className="bg-white sxl:w-[450px] sxl:h-[250px] flex items-center flex-col">
              <text className="font-bold text-3xl">Hey, what's your name?</text>
              <input
                placeholder="Type here..."
                className={`w-full border my-6 border-solid px-1.5 py-2 h-[50px] rounded-md`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              
              <button
                className=" bg-blueNav w-[100px] rounded-md h-[40px] text-white font-semibold"
                onClick={handleNameNext}
              >
                Next
              </button>
            </div>
          )}
          {isPhoto && (
            <div className="sxl:w-[450px] sxl:h-[250px] flex items-center flex-col">
              <img
                src={imageSrc}
                alt="Profile"
                className="w-32 h-32 rounded-full mb-4"
              />{" "}
              <div className="bg-white space-x-3 flex items-center">
                {" "}
                <label className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded-lg cursor-pointer">
                  Choose File
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
                <span className="text-sm text-gray-500">{fileName}</span>
              </div>
              <button
                className=" bg-blueNav w-[150px] rounded-xl p-1 my-3 text-white font-semibold"
                onClick={sendData}
              >
                Confirm Submit
              </button>
              <Link
                to={{ pathname: "/home" }}
                className="flex flex-row w-[150px] bg-blueNav p-1 justify-center text-white font-semibold rounded-xl items-center"
              >
                Home
              </Link>
            </div>
          )}
        </div>

        <div className="flex justify-end p-2">
          <div className="">
            <img
              src="logo.jpeg"
              alt="logo"
              className="rounded-full  border h-[80px] w-[80px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
