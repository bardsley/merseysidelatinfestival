import React, { useEffect, useState } from "react";
import Countdown from "react-countdown";

export const CountdownElement = (props: {date: string}) => {
  const [ isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])
  const dateToCountTo = new Date(props.date)
  return isLoaded && <Countdown date={dateToCountTo} />
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