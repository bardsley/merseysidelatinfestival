'use client'
import {Fragment } from "react";
import { format } from "date-fns";
import { locations } from '@tina/collection/options'
// import { useSearchParams } from "next/navigation";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export const ArtistTimetable = ({classes}) => {
  // const searchParams = useSearchParams()
  // const draft = searchParams.get('draft')

  const cellClassNames = "p-3 align-top border border-gray-600";
  const headClassNames = "p-3 text-left"
  return classes && classes.length > 0 ? ( //TODO This needs removing once we hvae classes beign set as live or draft
    <>
      <h2 className="text-2xl mt-4">Classes</h2>
      <table className="text-lg mb-2">
        <thead>
          <tr>
            <th className={headClassNames}>Day</th>
            <th className={headClassNames}>Time</th>
            <th className={headClassNames}>Location</th>
          </tr>
        </thead>
      {classes.map((class_) => (
        <Fragment key={`${class_.id}-1`}>
      
          <tr key={`${class_.id}-1`} className="text-sm">
            <td className={cellClassNames + " text-nowrap"}>{format(class_.date,'E do MMM')}</td>
            <td className={cellClassNames}>{format(class_.date,'HH:mm')}</td>
            <td className={cellClassNames}>{locations[class_.location].title}</td>
            
          </tr>
          <tr key={`${class_.id}-2`}>
            <td colSpan={3} className={cellClassNames}>
              <h3 className="font-bold text-lg">{class_.title}</h3>
              <div className="prose-base text-white">
                <TinaMarkdown content={class_.details} />
                {/* <pre>{JSON.stringify(class_,null,2)}</pre> */}
              </div>
            </td>
          </tr>
        </Fragment>
      ))}
      </table>
    </>
  ) : null
}
