import Layout from "@components/layout/layout";
import client from "@tina/__generated__/client";
import TimetableClientPage from "./timetable-client-page";
// import { parseISO, getUnixTime } from "date-fns";

export default async function TimetablePage() {
  const classes = await client.queries.classConnection({filter: { date: {after: "2025-01-01T07:00:00.000Z" }}, sort: 'date', first: 100});
  // const classes = classesRaw.data.classConnection.edges.sort((a,b) => { 
  //   const aTime = getUnixTime(parseISO(a.node.date))
  //   const bTime = getUnixTime(parseISO(b.node.date))
  //   const aLocation = a.node.location
  //   const bLocation = b.node.location
  //   let locationOrder = 0
  //   if(aLocation == 'ballroom') { locationOrder = -1 }
  //   else if(bLocation == 'ballroom') { locationOrder = -1 }

  //   return aTime == bTime ? locationOrder : aTime-bTime
  // })
  if (!classes || classes.data?.classConnection.edges.length === 0) {
    return <Layout rawPageData={classes}>
      <div className="grid grid-cols-11 text-black p-8 gap-0">
        <h1 className="col-span-11 text-center leading-10 pb-5 pt-24 font-black text-4xl md:text-5xl lg:text-8xl uppercase text-white">Timetable Coming Soon!</h1>
      </div>
    </Layout>;
  }

  return (
    <Layout rawPageData={classes}>
     
      <TimetableClientPage {...classes} />
      {/* <pre className="text-white">
        {JSON.stringify(classes.data?.classConnection.edges.map((cla)=>{ return `${cla.node.title} ${cla.node.location} ${cla.node.date}`}),null,2)}
      </pre> */}

    </Layout>
  );
}
