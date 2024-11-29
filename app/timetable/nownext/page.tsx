import Layout from "@components/layout/layout";
import client from "@tina/__generated__/client";
import LevelIndicator from "./level-indicator";
import TimetableFooter from "./timetable-footer";
import NowAndNext from "./now-and-next";

export default async function NowNextPage() {
  const classes = await client.queries.classConnection({sort: 'date', first: 500});

  if (!classes) { return <div>No Classes</div>; }
  const classesUnordered = classes.data?.classConnection.edges.map((item)=> item.node)


  return (
    <Layout rawPageData={classes} cleanLayout={true}>
      <div className="text-white p-12 flex flex-col justify-between h-screen border">
        <div className="flex pl-[100px] gap-[3vw]">
          <h1 className="text-[3vw] font-bold uppercase ">Coming Up
            {/* {maxNumRooms} {rooms} */}
          </h1> 
          <LevelIndicator/>
        </div>
      
        <NowAndNext classesUnordered={classesUnordered} basic={false}/>
    
        <TimetableFooter/>
      </div>      
    </Layout>
  );
}


