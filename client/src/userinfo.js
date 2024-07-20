import { useState } from "react";
import axios from "axios";
import Select from "react-select";
import ReactGA from "react-ga"

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
  const [imageSrc, setImageSrc] = useState("logo.jpeg");
  

  const handleNameNext = () => {
    ReactGA.event({
      category: 'User',
      action: 'Clicks Next',
      label: 'User Clicks Next'
    });

    const hasOtherOccupation = occupation.some(option => option.value === "Others");
    const hasOtherReason = reason.some(option => option.value === "Others");
    
    if (name && comment && occupation.length > 0 && reason.length > 0 && (!hasOtherOccupation || customOccupation) && (!hasOtherReason || customReason)) {
      setIsName(false);
      setIsPhoto(true);
    } else {
      alert("Please fill out all fields before proceeding.");
    }
  };

  const handlePhotoBack = () => {
    ReactGA.event({
      category: 'User',
      action: 'Backs to Name',
      label: 'User Backs to Name'
    });

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
    { name: "Others" }
  ];

  const whyData = [
    { reason: "Natural Language Capabilities" },
    { reason: "Scheduling Across Timezones" },
    { reason: "Convenience of Scheduling on the go" },
    { reason: "Attaching Conference Links" },
    { reason: "Find best time for a meeting" },
    { reason: "Others" }
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
    ReactGA.event({
      category: 'User',
      action: 'Changes Image',
      label: 'User Changes Image'
    });
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
    ReactGA.event({
      category: 'User',
      action: 'Sends User Data',
      label: 'User Sends User Data'
    });
    const processedReason = reason.map(obj => obj.value);
    const processedOccupation = occupation.map(obj => obj.value);
    try {
      const res = await axios.post(
        process.env.REACT_APP_UPDATE_PROFILE_URL /*||
        "http://localhost:3001/update-profile"*/,
        {
          name: name,
          imageSrc: imageSrc,
          comment: comment,
          occupation: processedOccupation.includes("Others") ? [...processedOccupation, customOccupation] : processedOccupation,
          reason: processedReason.includes("Others") ? [...processedReason, customReason] : processedReason
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Include this in the same object as headers
        }
      );
      console.log(res.data.message);
      const homeUrl = process.env.REACT_APP_HOME_URL
      window.location.href = homeUrl; /*||
            "http://localhost:3000/home?auth=success"*/// Redirect to the specified URL
    } catch (error) {
      console.error("Error updating user profile:", error);
      alert("Failed to update profile.");
    }
  };


  const handleSelectOption = (selectedOption) => {
    setOccupation(selectedOption);
    if (!selectedOption.some(option => option.value === "Others")) {
      setCustomOccupation("");
    }
  };

  const handleSelectWhy = (selectedOption) => {
    setReason(selectedOption);
    if (!selectedOption.some(option => option.value === "Others")) {
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
                  Hello there 👋! We hope to get to know you better.
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
                  {occupation.some(option => option.value === "Others") && (
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
                  {reason.some(option => option.value === "Others") && (
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
                className="bg-blueNav w-[100px] mt-5 rounded-md h-[40px] text-white font-semibold"
                onClick={handleNameNext}
              >
                Next
              </button>
            </div>
          )}
          {isPhoto && (
            <div className="sxl:w-[450px] sxl:h-[250px] flex items-center flex-col p-6">
              <img
                src={imageSrc}
                alt="Profile"
                className="w-32 h-32 rounded-full mb-4"
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
                className="bg-blueNav w-[150px] rounded-xl p-1 my-3 text-white font-semibold"
                onClick={sendData}
              >
                Submit
              </button>
              <button
                className="bg-gray-500 w-[150px] rounded-xl p-1 my-3 text-white font-semibold"
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
