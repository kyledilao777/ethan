import NavBar from "./components/navbar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; 
import axios from "axios";
import { useEffect, useState } from "react";
import { formatISO } from "date-fns";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [date, setDates] = useState([]);
  const [calendar, setCalendar] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3001/fetch-calendar-events",
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
        console.log(transformedEvents);
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      }
    };
    fetchEvents();
  }, []);

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
            className="rounded-md p-2 m-2"
            style={{ backgroundColor: "#85C694" }}
          >
            <div className="">
              <strong>
                <span className="break-words">{event.title}</span>
              </strong>
            </div>
            <div>
              {startTime} - {endTime}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div>
      <div className="flex flex-row">
        <NavBar />
        <div className="w-full p-5">
         <text className="text-xl font-bold">My Calendar</text>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendar}
            eventContent={renderEventContent}
            eventClick={(clickInfo) => {
              // Handle event click
              alert(clickInfo.event.title);
            }}
          />
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
      </ul> */ }
    </div>
  );
}
