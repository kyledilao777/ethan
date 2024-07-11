import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Select from "react-select";

export default function UserInfo() {
  const [name, setName] = useState("");
  const [isName, setIsName] = useState(true);
  const [isPhoto, setIsPhoto] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");
  const [occupation, setOccupation] = useState(null);
  const [comment, setComment] = useState("");
  const [reason, setReason] = useState([]);

  const handleNameNext = () => {
    setIsName(false);
    setIsPhoto(true);
  };

  const jobData = [
    { name: "Software Engineer" },
    { name: "Project Manager" },
    { name: "CEO" },
    { name: "Sales Managers" },
    { name: "Teacher" },
    { name: "Database Administrator" },
    { name: "Student" },
    { name: "Lawyer" },
    { name: "" },
  ];

  const whyData = [
    { reason: "Natural Language Processing" },
    { reason: "Scheduling Across Timezones" },
    { reason: "Convenience of Scheduling on the go" },
    { reason: "Attaching Conference Links" },
    { reason: "Find best time for a meeting" },
  ];

  const whyOptions = whyData.map((why) => ({
    value: why.reason,
    label: why.reason,
  }));

  const jobOptions = jobData.map((job) => ({
    value: job.name,
    label: job.name,
  }));

  const handleRadioChange = (event) => {
    setComment(event.target.value);
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
    const processedReason = reason.map(obj => obj.value)
    const res = await axios.post(
      "http://localhost:3001/update-profile",
      { name: name, imageSrc: imageSrc, comment: comment, occupation: occupation.value, reason: processedReason },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // Include this in the same object as headers
      }
    );
    console.log(res.data.message);
  };

  const handleSelectOption = (selectedOption) => {
    setOccupation(selectedOption);
  };

  const handleSelectWhy = (selectedOption) => {
    setReason(selectedOption);
  };

  return (
    <div className="w-full h-full ">
      <div className="w-full h-screen flex flex-col">
        <div className="w-full h-full flex items-center justify-center">
          {isName && (
            <div className="bg-white sxl:w-[1000px] sxl:h-fit flex items-center flex-col">
              <div className=" text-justify">
                <div className="font-bold text-3xl text-justify w-full">
                  Hello there 👋! Please kindly provide your details!
                </div>
              </div>

              <div className="w-full flex flex-row space-x-10 my-6">
                <div className="w-full">
                  <text className="font-semibold text-gray-500 opacity-80">
                    Chosen name
                  </text>
                  <input
                    placeholder="Type here..."
                    className={`w-full border border-solid px-1.5 py-2 h-[40px] mt-2 rounded-md`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="w-full">
                  <text className="font-semibold text-gray-500 opacity-80">
                    Occupation
                  </text>
                  <Select
                    className="mt-2"
                    options={jobOptions}
                    value={occupation}
                    onChange={handleSelectOption} // Handle selection change
                    placeholder="Select a job"
                  />
                </div>
              </div>
              <div className="w-full flex flex-row space-x-10 my-3">
                <div className="flex flex-col space-y-3 w-full">
                  <label className="font-semibold text-gray-500 opacity-80">
                    Would you be open to give more in-depth
                    feedback to us?
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="comments"
                        value="yes"
                        className="form-radio h-4 w-4 text-blue-600"
                        onChange={handleRadioChange}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="comments"
                        value="no"
                        className="form-radio h-4 w-4 text-blue-600"
                        onChange={handleRadioChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
                <div className="w-full">
                  <text className="font-semibold text-gray-500 opacity-80">
                    Why do you choose to use untangled?
                  </text>
                  <Select
                    className="mt-2"
                    options={whyOptions}
                    value={reason}
                    onChange={handleSelectWhy} // Handle selection change
                    placeholder="Select a reason"
                    isMulti
                  />
                </div>
              </div>
              {/* <button onClick={() => {
                console.log(reason, "this is reason")
                console.log(comment, "this is comment")
                console.log(occupation, "this is occupation")
              }}>Check</button> */}

              <button
                className=" bg-blueNav w-[100px] mt-5 rounded-md h-[40px] text-white font-semibold"
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
