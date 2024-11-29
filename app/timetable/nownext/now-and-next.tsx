'use client'
import { format,getUnixTime,fromUnixTime, parseISO } from "date-fns";
import { levels } from "@tina/collection/sessionLevels"
import { Fragment } from "react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
export const timeToTimeSlot = (dateToConvert) => {
  return `${getUnixTime(parseISO(dateToConvert))}-${format(dateToConvert,"HHmm-EEE")}`
}

const timeColor = "border-t-yellow-400"


const NowAndNext = ({classesUnordered,basic}) => {
  const params = useSearchParams()
  const timeTravel = params.get('at')
  const rightNow = timeTravel ? new Date(timeTravel): new Date()
  const rightNowUnix = getUnixTime(rightNow)
  const secondsIntoSession = rightNowUnix % (30 * 60)
  const sessionBegining = rightNowUnix - secondsIntoSession
  const day = format(fromUnixTime(sessionBegining-(181*60)),"eeee")
  
  const todaysSessions = classesUnordered.filter((current)=> day == format(current.date,"eeee"))
  const sessionNotFinishedYet = (todaysSessions?.length > 0 ? todaysSessions : classesUnordered).filter((current)=> getUnixTime(current.date) >= sessionBegining )
  const sessionLeft = sessionNotFinishedYet.length > 0 
  const sessionsToConsider = sessionLeft ? sessionNotFinishedYet : todaysSessions.length > 0 ? todaysSessions : classesUnordered
  const nextThreeIshSessionKeys = sessionLeft
    ? Array.from(new Set(sessionsToConsider.map((session)=>timeToTimeSlot(session.date)))).slice(0,3)
    : [timeToTimeSlot(sessionsToConsider.slice(-1)[0].date)]

  const sessionsToDisplay = sessionsToConsider.reduce((organised,current) => { 
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


  return <div className="grid grid-cols-[8vw_minmax(400px,_1fr)]">
  <div className="">
    {/* <p>Today {todaysSessions.length}</p>
    <p>Not Finished {sessionNotFinishedYet.length}</p>
    <p>Any left {sessionLeft ? "true" : "false"}</p>
    <p>Consider {sessionsToConsider.length}</p>
    <p>Next three {nextThreeIshSessionKeys.length}</p> */}

  </div>
  <RoomHeaders numberOfSessions={maxNumRooms} day={day} rooms={rooms} />
  {
    Object.keys(sessionsToDisplay).sort().map((timeSlot) => {
      const time = format(fromUnixTime(parseInt(timeSlot.split('-')[0])),"mm") == '00' 
      ? `${format(fromUnixTime(parseInt(timeSlot.split('-')[0])),"haaa")}`
      : `${format(fromUnixTime(parseInt(timeSlot.split('-')[0])),"h:mmaaa")}`

      return <Fragment key={timeSlot}>
        {/* <div className={` col-span-${maxNumRooms}`}><h2>{slot}</h2></div> */}
        
        <div className={`border-t-[0.3vw] ${timeColor} font-bold`}><span className={`bg-yellow-400 px-[1vw] py-[0.5vw] text-[1.2vw] rounded-[0.6vw] relative -top-[1vw] text-black`}>{time}</span></div>

        <div className={`grid ${roomsToCol(maxNumRooms)}`}>
        {sessionsToDisplay[timeSlot]['all'] 
          ? <SingleTimeSlot session={sessionsToDisplay[timeSlot]['all']} numberOfSessions={maxNumRooms} />
          : rooms.map((roomName) => {
            const session = sessionsToDisplay[timeSlot][roomName]
            return <TimeSlot key={`${timeSlot}-${roomName}`} session={session} numberOfSessions={maxNumRooms} basic={basic}/>
          })
        }
        </div>
        </Fragment>
    })
  } 
</div>
}

const TimeSlot = ({session,numberOfSessions,basic}) => {
  const titleSize = numberOfSessions == 3 ? "text-[2vw]" : "text-[1.6vw]"
  const artistSize = numberOfSessions == 3 ? "text-[1.6vw]" : "text-[1.4vw]"
  const infoSize = numberOfSessions == 3 ? "text-[1.3vw]" : "text-[1.1vw]"
  const avatarSize = numberOfSessions == 3 ? "w-[33%]" : "w-[25%]"
  const padding = numberOfSessions == 3 ? "p-[1.3vw]" : "p-[1vw]"
  return <div className={`text-black border-t-[0.3vw] ${padding} ${timeColor} flex gap-[1.5vw] items-start`} 
  style={{backgroundColor: levels[session?.level]?.colour}}>
    {session?.artist?.avatar && !basic ? <Image src={session?.artist?.avatar} width={256} height={256}  alt="" className={`${avatarSize} aspect-square rounded-full shadow-2xl`} /> : null }
    <div>
      <h1 className={`${titleSize} font-bold leading-none`}>{session?.title}</h1>
      <p className={`${artistSize} leading-none`}>{session?.artist?.name}</p>
      <div className={`${infoSize} leading-none mt-[1vw]`}>
      <TinaMarkdown content={session?.details}/>
      </div>

      {/* {JSON.stringify(session,null,2)} */}
    </div>
    
  </div>
}

const SingleTimeSlot = ({session,numberOfSessions}) => {
  const fullWidthColor = session?.level == 'admin' ? 'text-white p-[1vw] bg-richblack-600 ' : 'text-black px-[1vw] py-[1vw] flex justify-center'
  return <div className={`${roomsToSpan(numberOfSessions)} text-[1.4vw] border-t-[0.3vw] ${timeColor} ${fullWidthColor}`}>
    <h1 className="text-[1.8vw] font-bold">{session?.title}</h1>
    <TinaMarkdown content={session?.details}/>
  </div> 
}

const RoomHeaders = ({rooms,day,numberOfSessions}) => {
  const gridCss = roomsToCol(numberOfSessions)
  return <div className={`grid ${gridCss}`}>
    {rooms.map((location)=>{ return <div className="bg-richblack-700 p-[1vw] block text-center text-white text-[1.4vw] font-bold uppercase col-span-1" key={`${day}-${location}`}>{location}</div>})}
  </div>

}

const roomsToCol = (rooms) => {
  let css = 'grid-cols-5'
  if(rooms == 4) { css = "grid-cols-4"}
  if(rooms == 3) { css = "grid-cols-3" }
  if(rooms == 2) { css = "grid-cols-1" }  
  return css
}

const roomsToSpan = (rooms) => {
  let css = 'col-span-5'
  if(rooms == 4) { css = "col-span-4"}
  if(rooms == 3) { css = "col-span-3" }
  if(rooms == 2) { css = "col-span-1" }  
  return css
}

export default NowAndNext