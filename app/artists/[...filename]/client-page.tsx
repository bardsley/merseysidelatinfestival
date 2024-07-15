"use client";
import {Fragment } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { Section } from "../../../components/layout/section";
import { Container } from "../../../components/layout/container";
import { ArtistQuery } from "../../../tina/__generated__/types";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { FaFacebookSquare, FaYoutube } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { format } from "date-fns";
import {locations } from '../../../tina/collection/options'
interface ArtistClientPageProps {
  data: {
    artist: ArtistQuery["artist"];
  };
  classes: {id: string,title: string,details: any, date: string, location: string, artist_id: string}[],
  variables: {
    relativePath: string;
  };
  query: string;
}

export default function ArtistClientPage(props: ArtistClientPageProps) {
  // console.log(props)
  const { data } = useTina({...props});
  const { artist } = data;
  const classes = props.classes

  const cellClassNames = "p-3 align-top border border-gray-600";
  const headClassNames = "p-3 text-left"
  return (<>
      <Section color={'merseyside'}>
      <Container
        size="medium"
        className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-14 items-start justify-center"
      >
        <img src={artist.avatar} alt="" data-tina-field={tinaField(data.artist, "avatar")} className="rounded-full w-80 md:w-full max-w-1/2 md:max-w-full mx-auto"/>
        <div className="md:col-start-2 md:col-end-5">
          <h1 data-tina-field={tinaField(data.artist, "name")} className="text-5xl font-bold text-center md:text-left ">{artist.name}</h1>
          <div className="prose-base text-white" data-tina-field={tinaField(data.artist, "about")}>
            <TinaMarkdown  content={artist.about} />
          </div>
          {classes && classes.length > 0 && (
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
                    </div>
                  </td>
                </tr>
              </Fragment>
            ))}
            </table>
          </>
          )}
    
        {/* <pre className="mt-12">{JSON.stringify(classes,null,2)}</pre>
        <pre className="mt-12">{JSON.stringify(artist,null,2)}</pre> */}
        </div>

        <div className="md:col-start-5 md:col-end-6 flex flex-wrap justify-center items-center md:justify-start mt-6 md:mt-0 gap-6 md:gap-2">
          <h2 className="text-3xl mb-4 md:mb-0 mt-6 md:mt-0 hidden md:block">Socials</h2>
          {artist.socials.map((social) => (
            <div key={social.handle} className="text-lg" data-tina-field={tinaField(social, "handle")}>
              <a href={social.url} target="_blank" rel="noreferrer" className="text-sm flex items-center gap-2">
                {social.type === "facebook" && (
                  <FaFacebookSquare className="block opacity-80 hover:opacity-100 transition ease-out duration-150 w-8 h-8 text-blue-600" />
                )}
                {social.type === "youtube" && (
                  <FaYoutube className="block opacity-80 hover:opacity-100 transition ease-out duration-150 w-8 h-8 text-chillired-800" />
                )}
                {social.type === "instagram" && (
                  <AiFillInstagram className="block opacity-80 hover:opacity-100 transition ease-out duration-150 w-8 h-8 text-red-500" />
                )}{" "}
                {social.handle}
              </a>
            </div>
          ))}
        </div>       
      </Container>
      </Section>
  </>);
}
