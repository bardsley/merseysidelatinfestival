'use client'
import { useState } from "react";

export type StatLine = {
  name: string;
  value: string;
  unit?: string;
};
export default function StatBlock({stats}: {stats: StatLine[]}) {
  const [hidden,setHidden] = useState(true);

  const toggelButton =  <div className="w-full flex absolute -top-12 right-2 justify-end"><button className="border border-gray-600 text-gray-400 hover:text-gray-50 hover:border-gray-100 rounded-md px-3 pt-1 mt-3 text-xs" onClick={()=>{setHidden(!hidden)}}>{ hidden ? "Show" : "Hide"} Stats</button></div>
  const statBlock = (<div className="mx-auto max-w-7xl bg-richblack-500 rounded-lg">
      <div className="grid gap-px bg-red/5 w-full grid-cols-2 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className=" bg-richblack-700 rounded-md px-4 pt-0 pb-2 sm:py-6 sm:px-6 lg:px-8 flex sm:block">
            <p className="text-sm font-medium leading-6 text-gray-400 hidden sm:block">{stat.name}</p>
            <p className="sm:mt-2 flex items-baseline gap-x-2 flex-col sm:flex-row">
              <span className="text-4xl font-semibold tracking-tight text-white">{stat.value}</span>
              {stat.unit ? <span className="text-sm text-gray-400">{stat.unit} <span className="inline sm:hidden text-sm text-gray-400">{stat.name.toLowerCase()}</span></span> : <span className="inline sm:hidden text-sm text-gray-400">{stat.name.toLowerCase()}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>)
  
  return (
    <div className="relative">
      { toggelButton } 
      { hidden ? null : statBlock }
    </div>
  )
}
