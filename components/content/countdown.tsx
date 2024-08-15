import React, { useEffect, useState } from "react";
import Countdown from "react-countdown";

const valueClasses = " text-2xl md:text-5xl font-bold";
const containerClasses = "flex flex-wrap max-w-md gap-x-6 justify-center items-center border border-richblack-700  bg-richblack-500 p-6 rounded-xl mb-3";
const headerClasses = "w-full text-center text-lg"

const preEventRenderer = ({ days, hours, minutes, seconds, completed, props }) => {
  const message = {
    before: props['data-message-before'] ? props['data-message-before'] : "That's right, only {days} sleeps to go!", 
    today: props['data-message-today'] ? props['data-message-today'] : "It's today!",    
    during: props['data-message-during'] ? props['data-message-during'] : "It's happening right now!",    
    after: props['data-message-after'] ? props['data-message-after'] : "It's already started!",
  }
  // const eventLength = {days: 2, hours: 6, minutes: 60, seconds: 60};
  if (completed) {
    // Render a completed state
    return <div className={containerClasses}>
            <h2 className="w-full text-center text-3xl font-bold">{ message.after}</h2>
            </div>
  } else {
    // Render a countdown
    return (<div className={containerClasses}>
      { days > 0 
        ? <div className={headerClasses}>{message.before.replace('{days}', `${days}`)}</div> 
        : <div className="w-full text-center text-3xl font-bold">{message.today}</div> 
     }

      { days > 0 ? <div><span className={valueClasses}>{days}</span> days</div> : null }
      { hours > 0 || days > 0 ? <div><span className={valueClasses}>{hours}</span> hours</div> :null }
      { (minutes > 0 || hours > 0) && days < 10 ? <div><span className={valueClasses}>{minutes}</span> mins</div> : null }
      { days < 1 ?  <div><span className={valueClasses}>{seconds}</span> secs </div> : null }
      </div>
    )
  }
};

const duringEventRenderer = ({ days, hours, minutes, seconds, completed, props}) => {
  const message = {
    before: props['data-message-before'] ? props['data-message-before'] : "That's right, only {days} sleeps to go!", 
    today: props['data-message-today'] ? props['data-message-today'] : "It's today!",    
    during: props['data-message-during'] ? props['data-message-during'] : "It's happening right now!",    
    after: props['data-message-after'] ? props['data-message-after'] : "It's already started!",
  }

  // const eventLength = {days: 2, hours: 6, minutes: 60, seconds: 60};
  if (completed) {
    // Render a completed state
    return <div className={containerClasses}>
            <div className="w-full text-center text-lg ">{message.after}</div> 
            { days > 0 ? <div><span className={valueClasses}>{days}</span> days</div> : null }
            { hours > 0 ? <div><span className={valueClasses}>{hours}</span> hours</div> :null }
            { minutes > 0 ? <div><span className={valueClasses}>{minutes}</span> mins</div> : null }
            { days < 1 ?  <div><span className={valueClasses}>{seconds}</span> secs </div> : null }
            {/* <h2 className="w-full text-center text-3xl font-bold"></h2> */}
            {/* <div className="w-full text-center text-3xl font-bold">{days}:{hours}:{minutes}:{seconds} = {total/1000}</div> */}
            </div>
  } else {
    // Render a countdown
    return (<div className={containerClasses}>
  
      <div className="w-full text-center text-lg ">{message.during}</div> 
      { days > 0 ? <div><span className={valueClasses}>{days}</span> days</div> : null }
      { hours > 0 ? <div><span className={valueClasses}>{hours}</span> hours</div> :null }
      { minutes > 0 ? <div><span className={valueClasses}>{minutes}</span> mins</div> : null }
      { days < 1 ?  <div><span className={valueClasses}>{seconds}</span> secs </div> : null }
      </div>
    )
  }
};

export const CountdownElement = (props: {date: string, message_before: string, message_today: string, message_after: string, message_during:string, duration:number}) => {
  const [ isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])
  const dateToCountTo = new Date(props.date)
  const inTheFuture = Date.now() - dateToCountTo.getTime() < 0
  // const endOfEvent = new Date(dateToCountTo.getTime() + 56*60*60*1000) 
  const eventDuration = props.duration ? props.duration * 60 *1000 : 56*60*60*1000
  const endOfEvent = new Date(dateToCountTo.getTime() + eventDuration) 
  const countDownTimer = inTheFuture 
    ? <Countdown overtime={true} date={dateToCountTo} renderer={preEventRenderer} 
      data-message-before={props.message_before}
      data-message-during={props.message_during}
      data-message-today={props.message_today}
      data-message-after={props.message_after}/> 
    : <Countdown overtime={true} date={endOfEvent} renderer={duringEventRenderer}
      data-message-during={props.message_during}
      data-message-after={props.message_after}/>
  return isLoaded && countDownTimer
}

export const CountdownElementTemplate = {
  name: "CountdownElement",
  label: "Countdown Element",
  fields: [{
    name: "date",
    label: "Date",
    type: "datetime",
    ui: {
      timeFormat: "HH:mm"
    },
  }, {
    name: "message_before",
    label: "Message Before",
    type: "string",
  },
  {
    name: "message_today",
    label: "Message on the day",
    type: "string",
  }, 
  {
    name: "message_during",
    label: "Message during",
    type: "string",
  }, 
  {
    name: "duration",
    label: "Duration of thing in minutes",
    type: "number",
  }, 
  {
    name: "message_after",
    label: "Message After",
    type: "string",
  }, 
  ]
}

export default CountdownElement