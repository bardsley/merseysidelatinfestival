export type StatLine = {
  name: string;
  value: string;
  unit?: string;
};
export default function StatBlock({stats}: {stats: StatLine[]}) {
  return (
    <div className="bg-richblack-500 rounded-lg">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-px bg-red/5 grid-cols-2 md:grid-cols-4">
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
      </div>
    </div>
  )
}
