import Layout from "@components/layout/layout";
import client from "@tina/__generated__/client";
import TimetableClientPage from "./timetable-client-page";
// import { parseISO, getUnixTime } from "date-fns";

export default async function TimetablePage() {
  const classes = await client.queries.classConnection({sort: 'date', first: 100});
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
  if (!classes) {
    return null;
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
