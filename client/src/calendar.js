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
        const res = await axios.get(process.env.REACT_APP_FETCH_CALENDAR_URL, {
          withCredentials: true,
        });
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
            id: event.id,
            title: event.summary,
            start: start,
            end: end,
          };
        });
        setEvents(transformedEvents);
        setCalendar(transformedEventsCalendar);
        const today = new Date().toISOString().split("T")[0];
        const todayToDoList = transformedEvents.filter((event) => {
          if (event.start) {
            return today === event.start.split("T")[0];
          }
        });
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
  const mainContentClass = isNavOpen ? "xsm:ml-[300px] sxl:ml-[100px]" : "px-[20px]";
  const calendarWidth = isNavOpen ? "w-5/6" : "w-4/5";

  return (
    <div className="flex sxl:flex-row xsm:flex-col">
      <NavBar setIsNavOpen={setIsNavOpen} />

      <div className={`w-full m-10 sxl:mt-11 xsm:mt-20 transition-all duration-300 ${mainContentClass}`}>
        <div className="">
          <span className="text-3xl font-bold">My Calendar</span>
        </div>

        <div className="flex xsm:flex-col bg-white sxl:flex-row w-full sxl:space-x-5 sxl:justify-between mt-4">
          <div className={`${calendarWidth} p-4 h-fit bg- rounded-lg shadow-lg`}>
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
          <div className="sxl:w-1/4 xsm:w-4/5 xsm:mt-10 sxl:mt-0 bg-white shadow-xl rounded-lg p-4 flex flex-col justify-between">
            <div>
              <span className="text-black text-2xl">To do List</span>
              {todayToDoList.map((item, index) => (
                <div key={index} className="bg-slate-300 my-4 px-3 rounded-md">
                  <div className="flex justify-between h-20 items-center">
                    <span>{item.summary}</span>
                    <span>
                      {item.start.split("T")[1].split("+")[0]} -{" "}
                      {item.end.split("T")[1].split("+")[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            // <div className="flex items-center w-full bg-slate-100 space-x-2">
            //   <input className="border-gray-200 border-solid border-2 p-1 w-full rounded-md" />
            //   <Mic className="" size="30" />
            // </div>
          </div>
        </div>
      </div>
    </div>
  );
}
