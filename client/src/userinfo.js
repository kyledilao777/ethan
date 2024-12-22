import { useState } from "react";
import axios from "axios";
import Select from "react-select";
import { Link } from "react-router-dom";


export default function UserInfo() {
  const [name, setName] = useState("");
  const [isName, setIsName] = useState(true);
  const [isPhoto, setIsPhoto] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");
  const [occupation, setOccupation] = useState([]);
  const [customOccupation, setCustomOccupation] = useState("");
  const [comment, setComment] = useState("");
  const [reason, setReason] = useState([]);
  const [customReason, setCustomReason] = useState("");
  const [imageSrc, setImageSrc] = useState("profilephoto.png");
  const [errorMessage, setErrorMessage] = useState("");

  const handleNameNext = () => {


    const hasOtherOccupation = occupation.some(
      (option) => option.value === "Others"
    );
    const hasOtherReason = reason.some((option) => option.value === "Others");

    if (
      name &&
      comment &&
      occupation.length > 0 &&
      reason.length > 0 &&
      (!hasOtherOccupation || customOccupation) &&
      (!hasOtherReason || customReason)
    ) {
      setIsName(false);
      setIsPhoto(true);
    } else {
      alert("Please fill out all fields before proceeding.");
    }
  };

  const handlePhotoBack = () => {

    setIsName(true);
    setIsPhoto(false);
  };

  const jobData = [
    { name: "Accountant" },
    { name: "Administrative Assistant" },
    { name: "Analyst" },
    { name: "Customer Service Representative" },
    { name: "Engineer" },
    { name: "Freelancer" },
    { name: "Graphic Designer" },
    { name: "Human Resources Manager" },
    { name: "IT Support Specialist" },
    { name: "Marketing Manager" },
    { name: "Nurse" },
    { name: "Office Manager" },
    { name: "Operations Manager" },
    { name: "Product Manager" },
    { name: "Project Manager" },
    { name: "Sales Representative" },
    { name: "Software Developer" },
    { name: "Student" },
    { name: "Teacher" },
    { name: "Web Developer" },
    { name: "Writer" },
    { name: "Entrepreneur" },
    { name: "Others" },
  ];

  const whyData = [
    { reason: "Natural Language Capabilities" },
    { reason: "Scheduling Across Timezones" },
    { reason: "Convenience of Scheduling on the go" },
    { reason: "Attaching Conference Links" },
    { reason: "Find best time for a meeting" },
    { reason: "Others" },
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

  const handleImageChange = (event) => {

    const file = event.target.files[0];
    const validExtensions = ["image/jpeg", "image/png"];

    if (file && file.type.substr(0, 5) === "image" && validExtensions.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setFileName(file ? file.name : "No file chosen");
        setErrorMessage("");
      };
      reader.readAsDataURL(file);
    } else {
      setErrorMessage("All files chosen must be in JPG or PNG format");
      setImageSrc("profilephoto.png"); // Reset to default or handle error
    }
  };

  const sendData = async () => {

    const processedReason = reason.map((obj) => obj.value);
    const processedOccupation = occupation.map((obj) => obj.value);
    if (imageSrc == "profilephoto.png") {
      alert("You have not uploaded any profile photo yet");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:3001/update-profile",
        {
          name: name,
          imageSrc: imageSrc,
          comment: comment,
          occupation: processedOccupation.includes("Others")
            ? [...processedOccupation, customOccupation]
            : processedOccupation,
          reason: processedReason.includes("Others")
            ? [...processedReason, customReason]
            : processedReason,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Include this in the same object as headers
        }
      );
      alert("You have sucessfully updated your profile! Please proceed to choosing plans if you have not done so!");
      window.location.href = "http://localhost:3000/freemium";
      console.log(res.data.message);
      // Redirect to the specified URL
    } catch (error) {
      console.error("Error updating user profile:", error);
      alert("Failed to update profile.");
    }
  };

  const handleSelectOption = (selectedOption) => {
    setOccupation(selectedOption);
    if (!selectedOption.some((option) => option.value === "Others")) {
      setCustomOccupation("");
    }
  };

  const handleSelectWhy = (selectedOption) => {
    setReason(selectedOption);
    if (!selectedOption.some((option) => option.value === "Others")) {
      setCustomReason("");
    }
  };

  return (
    <div className="w-full h-full">
      <div className="w-full h-screen flex flex-col">
        <div className="w-full h-full flex items-center justify-center">
          {isName && (
            <div className="bg-white sxl:w-[1000px] sxl:h-fit flex items-center flex-col p-6">
              <div className="text-justify">
                <div className="font-bold text-3xl text-justify w-full">
                  Hello there 👋! We hope to get to know you better 😄
                </div>
              </div>

              <div className="w-full flex flex-row space-x-10 my-6">
                <div className="w-full">
                  <label className="font-semibold text-gray-500 opacity-80">
                    Chosen name
                  </label>
                  <input
                    placeholder="Type here..."
                    className="w-full border border-solid px-1.5 py-2 h-[40px] mt-2 rounded-md"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="w-full">
                  <label className="font-semibold text-gray-500 opacity-80">
                    Occupation
                  </label>
                  <Select
                    className="mt-2"
                    options={jobOptions}
                    value={occupation}
                    onChange={handleSelectOption} // Handle selection change
                    placeholder="Select a job"
                    isMulti
                  />
                  {occupation.some((option) => option.value === "Others") && (
                    <input
                      placeholder="Please specify"
                      className="w-full border border-solid px-1.5 py-2 h-[40px] mt-2 rounded-md"
                      value={customOccupation}
                      onChange={(e) => setCustomOccupation(e.target.value)}
                    />
                  )}
                </div>
              </div>
              <div className="w-full flex flex-row space-x-10 my-3">
                <div className="flex flex-col space-y-3 w-full">
                  <label className="font-semibold text-gray-500 opacity-80">
                    Would you be open to give more in-depth feedback to us?
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
                  <label className="font-semibold text-gray-500 opacity-80">
                    Why did you want to try Ethan?
                  </label>
                  <Select
                    className="mt-2"
                    options={whyOptions}
                    value={reason}
                    onChange={handleSelectWhy} // Handle selection change
                    placeholder="Select a reason"
                    isMulti
                  />
                  {reason.some((option) => option.value === "Others") && (
                    <input
                      placeholder="Please specify"
                      className="w-full border border-solid px-1.5 py-2 h-[40px] mt-2 rounded-md"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    />
                  )}
                </div>
              </div>
              <button
                className="bg-blueNav w-[100px] mt-5 hover:scale-105  transition-transform duration-300 ease-in-out rounded-lg h-[40px] text-white font-semibold"
                onClick={handleNameNext}
              >
                Next
              </button>
            </div>
          )}
          {isPhoto && (
            <div className={`sxl:w-[450px] sxl:h-[250px] flex items-center justify-center flex-col p-6 transition-opacity duration-1000 ease-in-out ${isPhoto ? "opacity-100" : "opacity-0"
              }`}>
              <div className="text-center font-bold mb-4 text-lg">
                Choose a Profile Photo
              </div>
              {errorMessage && (
                <div className="text-center font-bold mb-4 text-md text-red-500">
                  {errorMessage}
                </div>
              )}

              <img
                src={imageSrc}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
              <div className="bg-white space-x-3 flex items-center mb-4">
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
                className="bg-blueNav w-[150px] hover:scale-105 transition-transform duration-300 ease-in-out rounded-xl p-1 my-3 text-white font-semibold"
                onClick={sendData}
              >
                Next
              </button>

              <button
                className="bg-gray-500 w-[150px] hover:scale-105  transition-transform duration-300 ease-in-out rounded-xl p-1 my-3 text-white font-semibold"
                onClick={handlePhotoBack}
              >
                Back
              </button>

            </div>
          )}
        </div>


        <div className="flex justify-end p-2">
          <div className="">
            <img
              src="logo.jpeg"
              alt="logo"
              className="rounded-full border h-[80px] w-[80px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
