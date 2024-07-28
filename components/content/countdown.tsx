import React, { useEffect, useState } from "react";
import Countdown from "react-countdown";

const valueClasses = " text-2xl md:text-5xl font-bold";
const containerClasses = "flex flex-wrap max-w-md gap-x-6 justify-center items-center border border-richblack-700  bg-richblack-500 p-6 rounded-xl mb-3";
const headerClasses = "w-full text-center text-lg"

const preEventRenderer = ({ days, hours, minutes, seconds, completed }) => {
 
  // const eventLength = {days: 2, hours: 6, minutes: 60, seconds: 60};
  if (completed) {
    // Render a completed state
    return <div className={containerClasses}>
            <h2 className="w-full text-center text-3xl font-bold">It&apos;s already started!</h2>
            </div>
  } else {
    // Render a countdown
    return (<div className={containerClasses}>
      { days > 0 
        ? <div className={headerClasses}>That&apos;s right, only {days} sleeps to go!</div> 
        : <div className="w-full text-center text-3xl font-bold">It&apos;s today!</div> }

      { days > 0 ? <div><span className={valueClasses}>{days}</span> days</div> : null }
      { hours > 0 ? <div><span className={valueClasses}>{hours}</span> hours</div> :null }
      { minutes > 0 ? <div><span className={valueClasses}>{minutes}</span> mins</div> : null }
      { days < 1 ?  <div><span className={valueClasses}>{seconds}</span> secs </div> : null }
      </div>
    )
  }
};

const duringEventRenderer = ({ total, days, hours, minutes, seconds, completed }) => {
  

  // const eventLength = {days: 2, hours: 6, minutes: 60, seconds: 60};
  if (completed) {
    // Render a completed state
    return <div className={containerClasses}>
            <h2 className="w-full text-center text-3xl font-bold">It&apos;s already started?</h2>
            { 2-days > 0 ? <div><span className={valueClasses}>{2-days}</span> days</div> : null }
            { 6 - hours > 0 ? <div><span className={valueClasses}>{6-hours}</span> hours</div> :null }
            { 60 - minutes > 0 ? <div><span className={valueClasses}>{60 -minutes}</span> mins</div> : null }
            { days > 2 ?  <div><span className={valueClasses}>{60 - seconds}</span> secs </div> : null }
            <h2 className="w-full text-center text-3xl font-bold">left, Get down here!</h2>
            <div className="w-full text-center text-3xl font-bold">{days}:{hours}:{minutes}:{seconds} = {total/1000}</div>
            </div>
  } else {
    // Render a countdown
    return (<div className={containerClasses}>
  
      <div className="w-full text-center text-lg ">It&apos; Started! We dance for another</div> 
      { days > 0 ? <div><span className={valueClasses}>{days}</span> days</div> : null }
      { hours > 0 ? <div><span className={valueClasses}>{hours}</span> hours</div> :null }
      { minutes > 0 ? <div><span className={valueClasses}>{minutes}</span> mins</div> : null }
      { days < 1 ?  <div><span className={valueClasses}>{seconds}</span> secs </div> : null }
      </div>
    )
  }
};

export const CountdownElement = (props: {date: string}) => {
  const [ isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])
  const dateToCountTo = new Date(props.date)
  const inTheFuture = Date.now() - dateToCountTo.getTime() < 0
  const endOfEvent = new Date(dateToCountTo.getTime() + 56*60*60*1000) 
  const countDownTimer = inTheFuture ? <Countdown overtime={true} date={dateToCountTo} renderer={preEventRenderer}/> : <Countdown overtime={true} date={endOfEvent} renderer={duringEventRenderer}/>
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
    }]
}

export default CountdownElement