import Layout from "@components/layout/layout";
import client from "@tina/__generated__/client";
import { format,getUnixTime,fromUnixTime,parseISO } from "date-fns";
import { levels } from "@tina/collection/sessionLevels"
import { Fragment } from "react";

export const timeToTimeSlot = (dateToConvert) => {
  return `${getUnixTime(parseISO(dateToConvert))}-${format(dateToConvert,"HHmm-EEE")}`
}

const timeColor = "border-t-yellow-400"



export default async function NowNextPage() {
  const classes = await client.queries.classConnection({sort: 'date', first: 500});

  if (!classes) { return <div>No Classes</div>; }
  const classesUnordered = classes.data?.classConnection.edges.map((item)=> item.node)

  const rightNow = new Date('2024-11-29T19:39:14.000Z')
  const rightNowUnix = getUnixTime(rightNow)
  const secondsIntoSession = rightNowUnix % (30 * 60)
  const sessionBegining = rightNowUnix - secondsIntoSession
  const day = format(fromUnixTime(sessionBegining-(181*60)),"eeee")
  
  const todaysSessions = classesUnordered.filter((current)=> day == format(current.date,"eeee"))
  const sessionNotFinishedYet = todaysSessions.filter((current)=> getUnixTime(current.date) >= sessionBegining )
  const sessionLeft = sessionNotFinishedYet.length > 0 
  const sessionsToConsider = sessionLeft ? sessionNotFinishedYet : todaysSessions
  const nextThreeIshSessionKeys = sessionLeft
    ? Array.from(new Set(sessionsToConsider.map((session)=>timeToTimeSlot(session.date)))).slice(0,3)
    : [timeToTimeSlot(sessionsToConsider.slice(-1)[0].date)]

  const sessionsToDisplay = sessionsToConsider.filter((current)=> day == format(current.date,"eeee")).reduce((organised,current) => { 
  //   console.log(current)
    const timeSlot = timeToTimeSlot(current.date)
    if(nextThreeIshSessionKeys.includes(timeSlot)) {
      // const day = format(subMinutes(current.date,181),"eeee")
      const locationName  = current.location ? current.location : "unknown"
      const classBlock = {
        title: current.title,
        timeSlot: timeSlot,
        date: current.date,
        details: current.details,
        location: current.location,
        level: current.level || "unknown",
        artist: current.artist ? { 
          name: current.artist.name,
          avatar: current.artist.avatar ? current.artist.avatar : null,
          url: `/artists/${current.artist._sys.filename}`
        } : { name: null, avatar: null, url: '/artists'}
      }
      organised[timeSlot] = organised[timeSlot] ? organised[timeSlot] : {}
      organised[timeSlot][locationName] = organised[timeSlot][locationName] ? {...classBlock, title: "Duplicate"} : classBlock
    }
    return organised
  }, {})

  const maxNumRooms = Object.keys(sessionsToDisplay).reduce((highest,slotName) => {
    // console.log("SLOT",Object.keys(sessionsToDisplay[slotName]).length)
    const length = Object.keys(sessionsToDisplay[slotName]).length
    return length > highest ? length : highest
  }, 0 )

  const rooms = maxNumRooms == 3 
    ? ["ballroom","derby","hypostyle"]
    : maxNumRooms == 4 ? ["ballroom","derby","sefton","hypostyle"]
      : ["ballroom","derby","sefton","hypostyle","terrace"]
  
return (
    <Layout rawPageData={classes} cleanLayout={true}>
      <div className="text-white p-12">
      <h1 className="text-5xl font-bold uppercase ">Now & Next 
        {/* {maxNumRooms} {rooms} */}
      </h1> 

      <div className="grid grid-cols-[100px_minmax(400px,_1fr)]">
        <div className=""></div>
        <div className={`grid grid-cols-${maxNumRooms} `}>
          {rooms.map((location)=>{ return <div className="bg-richblack-700 p-4 block text-center text-white text-xl font-bold uppercase " key={`${day}-${location}`}>{location}</div>})}
        </div>
        {
          Object.keys(sessionsToDisplay).sort().map((timeSlot) => {
            const time = format(fromUnixTime(parseInt(timeSlot.split('-')[0])),"mm") == '00' 
            ? `${format(fromUnixTime(parseInt(timeSlot.split('-')[0])),"haaa")}`
            : `${format(fromUnixTime(parseInt(timeSlot.split('-')[0])),"h:mmaaa")}`
            const fullWidthColor = sessionsToDisplay[timeSlot]["all"]?.level == 'admin' ? 'text-white px-4 py-2 ' : 'text-black px-4 py-6 flex justify-center'

            return <Fragment key={timeSlot}>
              {/* <div className={` col-span-${maxNumRooms}`}><h2>{slot}</h2></div> */}
              <div className={`border-t-3 ${timeColor} font-bold`}><span className={`bg-yellow-400 px-3 py-1 rounded-lg relative -top-3 text-black`}>{time}</span></div>
              <div className={`grid grid-cols-${maxNumRooms}`}>
              {sessionsToDisplay[timeSlot]['all'] 
                ? <div className={`col-span-${maxNumRooms} border-t-3 p-6 ${timeColor} ${fullWidthColor}`}>{sessionsToDisplay[timeSlot]['all']?.title}</div> 
                : rooms.map((roomName) => {
                  return <div key={`${timeSlot}-${roomName}`} className={`text-black border-t-3 p-6 ${timeColor}`} style={{backgroundColor: levels[sessionsToDisplay[timeSlot][roomName].level].colour}}>{sessionsToDisplay[timeSlot][roomName]?.title || "none"}</div>
                })
              }
              </div>
              </Fragment>
          })
        } 
      </div>
      
      
      {/* <pre className="text-white">
        {JSON.stringify(classes.data?.classConnection.edges.map((cla)=>{ 
          // return cla.node
          return `${cla.node.title} ${cla.node.location} ${cla.node.date} ${timeToTimeSlot(cla.node.date)}`
        }),null,2)}
      </pre> */}
      </div>
    </Layout>
  );

}

