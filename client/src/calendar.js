import NavBar from "./components/navbar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Mic } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [date, setDates] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const calendarRef = useRef(null);
  const [todayToDoList, setTodayToDoList] = useState([]);
  const location = useLocation();
  useEffect(() => {
    if (calendarRef.current) {
      let calendarApi = calendarRef.current.getApi();
      console.log(isNavOpen);
      setTimeout(() => {
        calendarApi.updateSize();
      }, 250);
    }
  }, [isNavOpen]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          process.env.REACT_APP_FETCH_CALENDAR_URL /*||
          "http://localhost:3001/fetch-calendar-events"*/,
          { withCredentials: true }
        );
        // Transform events to the format FullCalendar expects
        const transformedEvents = res.data.map((event) => {
          const start = event.start?.dateTime || event.start?.date;
          const end = event.end?.dateTime || event.end?.date;
          const allDay = Boolean(event.start?.date);

          return {
            ...event,
            start: start,
            end: end,
            allDay,
          };
        });
        const transformedEventsCalendar = res.data.map((event) => {
          const start = event.start?.dateTime || event.start?.date;
          const end = event.end?.dateTime || event.end?.date;
          const allDay = Boolean(event.start?.date);
          return {
            id: event.id, // ensure this is unique for each event
            title: event.summary, // FullCalendar uses 'title', not 'summary'
            start: start,
            end: end, // Use ISO string or Date object
          };
        });
        setEvents(transformedEvents);
        setCalendar(transformedEventsCalendar);
        console.log(transformedEventsCalendar);
        const today = new Date().toISOString().split("T")[0]; // Get today's date in ISO format
        const todayToDoList = transformedEvents.filter((event) => {
          if (event.start) {
            return today === event.start.split("T")[0];
          }
          // Extract the date part of event start date
        });

        console.log(todayToDoList); // This will log today's to-do list
        setTodayToDoList(todayToDoList);
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      }
    };

    fetchEvents();
  }, [events]);

  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;

    const startTime = event.start
      ? new Date(event.start).toLocaleTimeString()
      : "";
    const endTime = event.end ? new Date(event.end).toLocaleTimeString() : "";

    const allDayTime =
      event.allDay && event.start
        ? new Date(event.start).toLocaleDateString()
        : "";

    return (
      <>
        {event.allDay ? (
          <div>
            <div>
              <strong>{event.title}</strong>
            </div>
            <div>All day - {allDayTime}</div>
          </div>
        ) : (
          <div
            className="rounded p-2 m-2 w-full md:max-w-xs"
            style={{ backgroundColor: "#ffec8b" }}
          >
            <div className="break-words">
              <strong>
                <span className="whitespace-break-spaces">{event.title}</span>
              </strong>
            </div>
            <div className="mt-3">
              <span className="c">
                {startTime} - {endTime}
              </span>
            </div>
          </div>
        )}
      </>
    );
  };
  const buttonClasses = "px-4 py-2 bg-blue-500 text-white rounded-md mr-2";

  const calendarWidth = isNavOpen ? "w-5/6" : "w-4/5";
  return (
    <div>
      <div className="flex flex-row ">
        <NavBar setIsNavOpen={setIsNavOpen} />

        <div className="w-full m-10 mt-11">
          <div className=" ">
            <text className="text-3xl font-bold">My Calendar</text>
          </div>

          <div className="flex flex-row w-full space-x-5 justify-between mt-4">
            <div
              className={`${calendarWidth} p-4 h-fit bg- rounded-lg shadow-lg`}
            >
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={calendar}
                eventContent={renderEventContent}
                eventClick={(clickInfo) => {
                  alert(clickInfo.event.title);
                }}
                headerToolbar={{
                  start: "title",
                  center: "",
                  end: "prev,today,next",
                }}
                customButtons={{
                  prev: {
                    text: "<",
                    click: () => {
                      calendarRef.current.getApi().prev();
                    },
                    classNames: buttonClasses,
                  },
                  next: {
                    text: ">",
                    click: () => {
                      calendarRef.current.getApi().next();
                    },
                    classNames: buttonClasses,
                  },
                  today: {
                    text: "Today",
                    click: () => {
                      calendarRef.current.getApi().today();
                    },
                    classNames: buttonClasses,
                  },
                }}
                className=""
              />
            </div>
            <div className="w-1/4 flex-none bg-white shadow-xl rounded-lg p-4 flex flex-col justify-between">
              <div>
                <text className="text-black text-2xl">To do List</text>
                {todayToDoList.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-300 my-4 px-3 rounded-md"
                  >
                    <div className="flex justify-between h-20 items-center">
                      <text>{item.summary}</text>
                      <text>
                        {item.start.split("T")[1].split("+")[0]} -{" "}
                        {item.end.split("T")[1].split("+")[0]}
                      </text>
                    </div>
                  </div>
                ))}
              </div>
              <div className=" flex items-center w-full justify-between">
                <input className="border-gray-200 border-solid border-2 p-1 w-[250px] rounded-md" />
                <Mic className="" size="30" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <ul>
        {events.map((event) => (
          <li key={event.id}>
            <div className="my-5">
              <div className="flex flex-col">
                <text> {event.summary}</text>
                <text> {event.start}</text>
                <text> {event.end}</text>
              </div>
            </div>
          </li>
        ))}
      </ul> */}
    </div>
  );
}
