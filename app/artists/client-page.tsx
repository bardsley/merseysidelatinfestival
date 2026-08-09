"use client";
// import { format } from "date-fns";
import Link from "next/link";
// import Image from "next/image";
import React from "react";
// import { useLayout } from "@components/layout/layout-context";
// import { BsArrowRight } from "react-icons/bs";
// import { TinaMarkdown } from "tinacms/dist/rich-text";
import {
  ArtistConnectionQuery,
  ArtistConnectionQueryVariables,
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
interface ClientPostProps {
  data: ArtistConnectionQuery;
  variables: ArtistConnectionQueryVariables;
  query: string;
}

export default function ArtistClientPage(props: ClientPostProps) {
  const { data } = useTina({ ...props });
  // const { theme } = useLayout();

  return (
    <div className="text-white grid grid-cols-2 md:grid-cols-3 gap-4 lg:grid-cols-4 max-w-5xl mx-auto my-6 w-full ">
      <h1 className="col-span-2 md:col-span-3 lg:col-span-4 text-5xl font-bold">Artists</h1>
      {data?.artistConnection.edges.filter(
          (artist) => artist.node._sys.relativePath.startsWith("2026/")
        ).map((artistData,index) => {
        const artist = artistData.node;
        const artistPath = artistData.node._sys.relativePath
        return (
          
            <Link
            key={`${artist.id}-${index}`}
            href={`/artists/` + artist._sys.breadcrumbs.join("/")}
            className="group block rounded-md relative aspect-square overflow-visible transition-colors duration-1500 ease-in-out text-white hover:text-gold-700"
          > 
          
            <img src={artist.avatar || "/avatar.jpg"} alt={artist.name}
              className="block rounded-full aspect-square w-full scale-75 hover:scale-100 absolute
              object-cover m-0 bg-auto bg-center bg-no-repeat overflow-hidden
              shadow transition-all duration-500 ease-out delay-150 hover:shadow-lg hover:z-0 z-20 opacity-100" 
            />
            <svg
              viewBox="0 0 106 106"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-0 left-0 w-full h-full z-10 fill-transparent"
            >
              <path
                id="circlePath"
                d="
                  M 13, 53
                  a 40,40 0 1,1 80,0
                  40,40 0 1,1 -80,0
                "
              />
              <text>
                <textPath href="#circlePath" className="fill-current leading-6 font-black tracking-tighter">
                  {artist.name.toUpperCase()}
                </textPath>
              </text>
            </svg>
            <p>{artistPath}{artistPath.startsWith("2026/") ? "Yes" : "No" }</p>
          </Link>
        
          
        )
      })}
    </div>
  );
}
