"use client";
import { format,parseISO, getUnixTime, fromUnixTime, subMinutes} from "date-fns";
import Link from "next/link";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import Image from "next/image";
import React, {Fragment} from "react";
// import { useLayout } from "@components/layout/layout-context";
// import { BsArrowRight } from "react-icons/bs";
// import { TinaMarkdown } from "tinacms/dist/rich-text";
import { levels } from "@tina/collection/sessionLevels"
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
  const { data } = useTina({ ...props });
  const timeColor = "border-t-yellow-400"
  const classesUnordered = data?.classConnection.edges.map((item)=> item.node)
  const classesOrganised = classesUnordered.reduce((organised,current) => { 
    console.log(current)
    const timeSlot = `${getUnixTime(parseISO(current.date))}-${format(subMinutes(current.date,181),"HHmm-EEE")}`
    const day = format(subMinutes(current.date,181),"eeee")
    const locationName  = current.location ? current.location : "unknown"
    const classBlock = {
      title: current.title,
      date: timeSlot,
      details: current.details,
      location: current.location,
      level: current.level || "unknown",
      artist: current.artist ? { 
        name: current.artist.name,
        avatar: current.artist.avatar ? current.artist.avatar : null,
        url: `/artists/${current.artist._sys.filename}`
      } : { name: null, avatar: null, url: '/artists'}
    }
    organised[day] = organised[day] ? organised[day] : {}
    organised[day][timeSlot] = organised[day][timeSlot] ? organised[day][timeSlot] : {}
    organised[day][timeSlot][locationName] = organised[day][timeSlot][locationName] ? {...classBlock, title: "Duplicate"} : classBlock
    return organised
  }, {})

  const locations = ["ballroom","derby","sefton","hypostyle","terrace"]
  const days = Object.keys(classesOrganised).sort()
  // const timeSlots = days.map((day) => Object.keys(classesOrganised[day]) )
  return <Fragment key="single">
    
    <div className="grid grid-cols-11 text-black p-8 gap-0">
    {days.map((day) => {
        return (<Fragment key={day}>
          <h1 className="col-span-10 col-start-2 text-right sm:text-left text-2xl md:text-5xl font-bold uppercase text-white" key={day}>{day}</h1>
          <span className="hidden md:block"></span>
          {locations.map((location)=>{
            return <span className="bg-richblack-700 p-4 col-span-2 hidden md:block text-center text-white text-sm lg:text-xl font-bold uppercase " key={`${day}-${location}`}>{location}</span>
          })}
          {Object.keys(classesOrganised[day]).map((timeSlot) => {
            const fullWidth = classesOrganised[day][timeSlot]["all"]
            const fullWidthColor = classesOrganised[day][timeSlot]["all"]?.level == 'admin' ? 'text-white px-4 py-2 ' : 'text-black px-4 py-6 flex justify-center'
            const time = format(fromUnixTime(parseInt(timeSlot.split('-')[0])),"mm") == '00' 
              ? `${format(fromUnixTime(parseInt(timeSlot.split('-')[0])),"haaa")}`
              : `${format(fromUnixTime(parseInt(timeSlot.split('-')[0])),"h:mmaaa")}`
            const timeCell = (<div className={`border-t-3 ${timeColor} font-bold`}><span className={`bg-yellow-400 px-3 py-1 rounded-lg relative -top-3`}>{time}</span></div>)
            return fullWidth ? <Fragment key={timeSlot}>{timeCell}
                <div className={`${fullWidthColor} text-xs sm:text-base col-span-10 flex gap-2 border-t-3 ${timeColor}`} style={{backgroundColor: levels[classesOrganised[day][timeSlot]["all"].level].colour}}>
                  <strong>{classesOrganised[day][timeSlot]["all"].title}</strong>
                  <TinaMarkdown content={fullWidth.details} />
                </div>
              </Fragment> : <Fragment key={timeSlot}>
              {timeCell}
              {locations.map((location) => {
                const clasS = classesOrganised[day][timeSlot][location] || false
                const level = levels[clasS.level] || false
                return clasS ? <Link href={clasS?.artist?.url || '#'} key={`${clasS.date}-${location}`} 
                  className={`bg-richblack-700 col-span-10 col-start-2 md:col-span-2 p-2 sm:p-4 flex flex-row md:flex-col justify-between items-center xl:flex-row gap-1 md:gap-3 border-t-3 ${timeColor} ${level ? '' : 'text-white'}`}
                  style={{backgroundColor: level.colour}}
                  >
                    {clasS?.artist?.avatar ? <Image className="rounded-full border-3 border-richblack-500 w-16 h-16 lg:w-24 lg:h-24" src={clasS.artist.avatar} alt={clasS.artist.name} width={250} height={250} /> : null }
                  <div className="flex-grow">
                  <h2 className="text-md md:text-sm lg:text-lg 2xl:text-2xl font-bold leading-4 md:leading-6">{clasS.title}</h2>
                  <p className="text-sm md:text-md lg:text-lg leading-4 md:leading-6">{clasS.artist.name} </p>
                  <TinaMarkdown content={clasS.details} />
                  </div>
                  <span className="rounded bg-richblack-600 text-white px-2 py-0.5 md:hidden">{clasS.location}</span>
                  {/* {clasS.level} */}
                  {/* {JSON.stringify(clasS,null,2)} */}
                  {/* {`${timeSlot} ${location}`} */}
                </Link> : <div key={`${timeSlot}-${location}`} className={`col-span-2 border-t-3 hidden md:block ${timeColor}`}>
                  {/* {timeSlot} {clasS.title} <TinaMarkdown content={fullWidth} /> {location} */}
                </div>
              })}
            </Fragment>
          })}
        </Fragment>
        )

      })}
    </div>
    {/* <pre className="text-white">{JSON.stringify(locations,null,2)} {JSON.stringify(days, null,2)}  {JSON.stringify(classesOrganised,null,2)}</pre> */}
  </Fragment>
}
