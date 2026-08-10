"use client";
import { format,parseISO, getUnixTime, fromUnixTime, subDays} from "date-fns";
import Link from "next/link";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import Image from "next/image";
import React, {Fragment,useRef,useEffect} from "react";
import { useSearchParams } from "next/navigation";
// import { useLayout } from "@components/layout/layout-context";
// import { BsArrowRight } from "react-icons/bs";
// import { TinaMarkdown } from "tinacms/dist/rich-text";
import { levels } from "@tina/collection/sessionLevels"
import { locations as locationDefinitions } from "@tina/collection/options"
import {
  ClassConnectionQuery,
  ClassConnectionQueryVariables,
} from "@tina/__generated__/types";
import { useTina } from "tinacms/dist/react";

// const titleColorClasses = {
//   blue: "group-hover:text-blue-600 dark:group-hover:text-blue-300",
//   teal: "group-hover:text-teal-600 dark:group-hover:text-teal-300",
//   green: "group-hover:text-green-600 dark:group-hover:text-green-300",
//   red: "group-hover:text-red-600 dark:group-hover:text-red-300",
//   pink: "group-hover:text-pink-600 dark:group-hover:text-pink-300",
//   purple: "group-hover:text-purple-600 dark:group-hover:text-purple-300",
//   orange: "group-hover:text-orange-600 dark:group-hover:text-orange-300",
//   yellow: "group-hover:text-yellow-500 dark:group-hover:text-yellow-300",
// };
interface ClientClassProps {
  data: ClassConnectionQuery;
  variables: ClassConnectionQueryVariables;
  query: string;
}



export default function TimetableClientPage(props: ClientClassProps) {
  const currentTimeSlot = useRef<HTMLElement | null>(null);
  const params = useSearchParams()
  const timeTravel = params.get('at')
  const scroll = params.get('scroll')
  const currentTime = getUnixTime(timeTravel ? new Date(timeTravel): new Date()) - (60*60)
  let timeSlotMarked = false
  const { data } = useTina({ ...props });
  const classesUnordered = data?.classConnection.edges.map((item)=> item.node)
  const classesOrganised = classesUnordered.reduce((organised,current) => { 
    // console.log(current)
    const sessionDate = parseISO(current.date)
    const sessionHour = Number(format(sessionDate, "H"))
    const festivalDate = sessionHour < 4 ? subDays(sessionDate, 1) : sessionDate
    const timeSlot = `${getUnixTime(sessionDate)}-${format(festivalDate,"HHmm-EEE")}`
    const festivalDay = format(festivalDate,"eeee")
    const sessionTime = Number(format(sessionDate, "HHmm"))
    const splitTime = festivalDay === "Saturday" ? 1800 : festivalDay === "Sunday" ? 1930 : null
    const day = splitTime
      ? `${festivalDay} ${sessionTime >= splitTime || sessionHour < 5 ? "Night" : "Day"}`
      : festivalDay
    const locationName  = current.location ? current.location : "unknown"
    const classBlock = {
      title: current.title,
      date: timeSlot,
      details: current.details,
      location: current.location,
      level: current.level || "unknown",
      artist1: current.artist1 ? { 
        name: current.artist1.name,
        avatar: current.artist1.avatar ? current.artist1.avatar : null,
        url: `/artists/${current.artist1._sys.breadcrumbs.join("/")}`
      } : { name: null, avatar: null, url: '/artists'},
      artist2: current.artist2 ? { 
        name: current.artist2.name,
        avatar: current.artist2.avatar ? current.artist2.avatar : null,
        url: `/artists/${current.artist2._sys.breadcrumbs.join("/")}`
      } : null
    }
    organised[day] = organised[day] ? organised[day] : {}
    organised[day][timeSlot] = organised[day][timeSlot] ? organised[day][timeSlot] : {}
    organised[day][timeSlot][locationName] = organised[day][timeSlot][locationName] ? {...classBlock, title: "Duplicate"} : classBlock
    return organised
  }, {})

  const locationOrder = Object.keys(locationDefinitions).filter((location) => location !== "all")
  const days = Object.keys(classesOrganised).sort()
  // const timeSlots = days.map((day) => Object.keys(classesOrganised[day]) )

  useEffect(()=>{
    if(currentTimeSlot?.current?.offsetTop) {
      console.log("Scrolling",currentTimeSlot.current.offsetTop)
      if(scroll) { window.scrollBy({top:currentTimeSlot.current.offsetTop  - 200, behavior: "smooth"}) }
    } 
  },[currentTimeSlot])

  return <Fragment key="single">
    
    <div className="text-black p-8">
    {days.map((day) => {
        const locations = Array.from(new Set(
          Object.values(classesOrganised[day]).flatMap((timeSlot) => Object.keys(timeSlot))
        ))
          .filter((location) => location !== "all")
          .sort((a, b) => {
            const aIndex = locationOrder.indexOf(a)
            const bIndex = locationOrder.indexOf(b)
            return (aIndex === -1 ? locationOrder.length : aIndex) - (bIndex === -1 ? locationOrder.length : bIndex)
          })
        const timeSlots = Object.keys(classesOrganised[day]).sort((a, b) => (
          Number(a.split("-")[0]) - Number(b.split("-")[0])
        ))
        const rowStarts = timeSlots.reduce((rows, timeSlot, index) => {
          if (index === 0) rows[timeSlot] = 2
          else {
            const previousSlot = timeSlots[index - 1]
            const previousSessions = classesOrganised[day][previousSlot]
            const previousHasRooms = locations.some((location) => previousSessions[location])
            rows[timeSlot] = rows[previousSlot] + (previousSessions.all && previousHasRooms ? 2 : 1)
          }
          return rows
        }, {})
        const gridEndRow = timeSlots.length
          ? rowStarts[timeSlots[timeSlots.length - 1]] + 1
          : 2
        const roomRowFor = (timeSlot) => {
          const sessions = classesOrganised[day][timeSlot]
          const hasRooms = locations.some((location) => sessions[location])
          return rowStarts[timeSlot] + (sessions.all && hasRooms ? 1 : 0)
        }

        const partyRowSpan = (location, timeSlotIndex) => {
          const nextSessionIndex = timeSlots.findIndex((candidateSlot, candidateIndex) => (
            candidateIndex > timeSlotIndex && (
              classesOrganised[day][candidateSlot][location] ||
              classesOrganised[day][candidateSlot].all
            )
          ))
          const startRow = roomRowFor(timeSlots[timeSlotIndex])
          return nextSessionIndex === -1
            ? gridEndRow - startRow
            : roomRowFor(timeSlots[nextSessionIndex]) - startRow
        }

        const isCoveredByParty = (location, timeSlotIndex) => {
          for (let index = timeSlotIndex - 1; index >= 0; index--) {
            const previousSessions = classesOrganised[day][timeSlots[index]]
            if (previousSessions.all) return false
            const previousSession = previousSessions[location]
            if (previousSession) return previousSession.level === "party"
          }
          return false
        }

        return (<Fragment key={day}>
          <h1 className="leading-10 pb-5 pt-24 font-black text-right sm:text-left text-4xl md:text-5xl lg:text-8xl uppercase text-white" key={day}>
            {day}
          </h1>
          <div
            className="timetable-day-grid"
            style={{ "--location-count": locations.length } as React.CSSProperties}
          >
          <span className="hidden md:block" style={{gridColumn: 1, gridRow: 1}}></span>
          {locations.map((location, locationIndex)=>{
            return <span className="bg-richblack-700 p-4 hidden md:block text-center text-white text-sm lg:text-xl font-bold uppercase sticky top-0 border-b-4 border-b-merseyblue-500" style={{gridColumn: locationIndex + 2, gridRow: 1}} key={`${day}-${location}`}>{locationDefinitions[location]?.title || location}</span>
          })}
          {timeSlots.map((timeSlot, timeSlotIndex) => {
            const fullWidth = classesOrganised[day][timeSlot]["all"]
            const hasRoomSessions = locations.some((location) => classesOrganised[day][timeSlot][location])
            const timeSlotRow = rowStarts[timeSlot]
            const roomSessionRow = timeSlotRow + (fullWidth && hasRoomSessions ? 1 : 0)
            const fullWidthColor = classesOrganised[day][timeSlot]["all"]?.level == 'admin' ? 'text-white px-4 py-2 ' : 'text-black px-4 py-6 flex justify-center'
            const time = format(fromUnixTime(parseInt(timeSlot.split('-')[0])),"mm") == '00' 
              ? `${format(fromUnixTime(parseInt(timeSlot.split('-')[0])),"haaa")}`
              : `${format(fromUnixTime(parseInt(timeSlot.split('-')[0])),"h:mmaaa")}`
            const shouldMarkRef = scroll && !timeSlotMarked && parseInt(timeSlot.split('-')[0]) > currentTime ? true : false
            const timeColor = shouldMarkRef ? "border-t-chillired-500":"border-t-yellow-400"

            if(shouldMarkRef) { timeSlotMarked = true}
            const timeCell = (<div className={`border-t-3 ${timeColor} font-bold flex items-start`} style={{gridColumn: 1, gridRow: timeSlotRow}}>
              <span ref={shouldMarkRef ? currentTimeSlot:null} className={`${shouldMarkRef ? "bg-chillired-500 text-white": "bg-yellow-400"} px-3 pl-2 pr-3 rounded-lg relative -top-3 mr-2 block`}>{shouldMarkRef ? "You Are Here": time}</span>
            </div>)
            return <Fragment key={timeSlot}>
              {timeCell}
              {fullWidth ? <div className={`${fullWidthColor} timetable-session-full text-xs sm:text-base flex gap-2 border-t-3 ${timeColor}`} style={{backgroundColor: levels[classesOrganised[day][timeSlot]["all"].level].colour, gridRow: timeSlotRow}}>
                  <strong>{classesOrganised[day][timeSlot]["all"].title}</strong>
                  <TinaMarkdown content={fullWidth.details} />
                </div>
              : null}
              {fullWidth && hasRoomSessions ? <div className={`border-t-3 hidden md:block ${timeColor}`} style={{gridColumn: 1, gridRow: roomSessionRow}} /> : null}
              {!fullWidth || hasRoomSessions ? locations.map((location, locationIndex) => {
                const clasS = classesOrganised[day][timeSlot][location] || false
                if (!clasS && isCoveredByParty(location, timeSlotIndex)) return null
                const level = levels[clasS.level] || false
                const rowSpan = clasS?.level === "party" ? partyRowSpan(location, timeSlotIndex) : 1
                return clasS ? <Link href={clasS?.artist1?.url || '#'} key={`${clasS.date}-${location}`} 
                  className={`bg-richblack-700 ${clasS.level === 'admin' ? 'text-white text-xs sm:text-base px-4 py-2' : 'p-2 sm:p-4'} flex flex-row md:flex-col justify-between items-center ${ clasS?.artist1?.avatar && clasS?.artist2?.avatar ? '2xl:flex-row' : '2xl:flex-row'} gap-1 md:gap-3 border-t-3 ${timeColor} ${!level ? 'text-white' : ''}`}
                  style={{backgroundColor: level.colour, gridColumn: locationIndex + 2, gridRow: `${roomSessionRow} / span ${rowSpan}`}}
                  >
                    { clasS?.artist1?.avatar || clasS?.artist2?.avatar ? 
                    <div className={`${ clasS?.artist1?.avatar && clasS?.artist2?.avatar ? ' h-28 sm:h-16 lg:h-24 lg:min-w-40 xl:min-w-42 ' : ' h-16 lg:h-24 lg:min-w-28 xl:min-w-42'} w-16 sm:w-28 relative flex flex-col`}>
                      {clasS?.artist2?.avatar ? <Image className={`rounded-full border-3 border-merseyblue-500 ww-12 wh-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 ${ clasS?.artist1?.avatar && clasS?.artist2?.avatar ? 'absolute sm:left-10 lg:left-16 sm:top-auto top-10' : ''}`} src={clasS.artist2.avatar} alt={clasS.artist2.name} width={250} height={250} /> : null }
                      {clasS?.artist1?.avatar ? <Image className={`rounded-full border-3 border-merseyblue-500 ww-12 wh-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 ${ clasS?.artist1?.avatar && clasS?.artist2?.avatar ? 'absolute sm:left--3 lg:left-0' : ''}`} src={clasS.artist1.avatar} alt={clasS.artist1.name} width={250} height={250} /> : null }
                    </div>

                    : null }
                    
                  <div className="flex-grow ">
                    <h2 className={`${clasS.level === 'admin' ? 'text-xs sm:text-base' : 'text-md md:text-sm lg:text-lg 2xl:text-2xl'} font-bold leading-4 md:leading-6`}>{clasS.title}</h2>
                    <p className="text-sm md:text-md lg:text-lg leading-4 md:leading-6">{clasS.artist1.name} </p>
                    <TinaMarkdown content={clasS.details} />
                  </div>
                  <span className="rounded bg-richblack-600 text-white px-2 py-0.5 md:hidden">{locationDefinitions[clasS.location]?.title || clasS.location}</span>
                  {/* {clasS.level} */}
                  {/* {JSON.stringify(clasS,null,2)} */}
                  {/* {`${timeSlot} ${location}`} */}
                </Link> : <div key={`${timeSlot}-${location}`} className={`border-t-3 hidden md:block ${timeColor}`} style={{gridColumn: locationIndex + 2, gridRow: roomSessionRow}}>
                  {/* {timeSlot} {clasS.title} <TinaMarkdown content={fullWidth} /> {location} */}
                </div>
              }) : null}
            </Fragment>
          })}
          </div>
        </Fragment>
        )

      })}
    </div>
    <pre className="hidden text-white">{JSON.stringify(days, null,2)} {JSON.stringify(classesOrganised,null,2)}</pre>
  </Fragment>
}
