"use client";
import React, { useState, useRef} from "react";

import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { Template } from "tinacms";
import { PageBlocksInstagram } from "../../tina/__generated__/types";
import { tinaField } from "tinacms/dist/react";
import { Container } from "../layout/container";
import { Section } from "../layout/section";
import BuyButton, { BuyButtonTemplate } from "../content/buybutton";
import CountdownElement, { CountdownElementTemplate } from "../content/countdown";
import {  RichTextTemplate } from "@tinacms/schema-tools"
import useSWR from 'swr'
import Image from "next/image";
import Link from "next/link";
import {Icon} from "../icon"
import { Carousel } from "@material-tailwind/react";

const components = { BuyButton, CountdownElement }

const proseClasses = "prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl \
prose-a:text-chillired-600 hover:prose-a:text-chillired-800 \
prose-blockquote:border prose-blockquote:border-richblack-700 prose-blockquote:p-6 prose-blockquote:rounded-md prose-blockquote:text-xl prose-blockquote:m-3 prose-blockquote:bg-richblack-500 \
prose-p:mb-3 \
prose-strong:font-semibold \
prose-ul:list-disc prose-ul:list-inside prose-ol:list-decimal prose-ol:list-inside prose-li:pl-3 \
"
const fetcher = url => fetch(url).then(r => r.json())

export const Instagram = ({ data }: { data: PageBlocksInstagram }) => {
  const { data:instaData, error, isLoading, isValidating } = useSWR('/api/instagram', fetcher)


  if (error) return <InstagramSection data={data}>Error: {error.message}</InstagramSection>
  else if (isLoading) return <InstagramSection data={data}>Loading @merseysidelatinfestival posts...</InstagramSection>
  else if (isValidating) return <InstagramSection data={data}>Validating they&apos;re all legit...</InstagramSection>
  else {
    return (
      <InstagramSection data={data}>
          <TinaMarkdown content={data.body} components={components} />
          {instaData && instaData.instagram_posts && instaData.instagram_posts.length > 0 && (
            <div className="flex gap-x-3 items-start">
              {instaData.instagram_posts.map(post => { 
                if(post.media_type == 'IMAGE') {
                  return <InstagramImage key={post.id} post={post} />
                } 
                else if(post.media_type == 'VIDEO') {
                  return <InstagramVideo key={post.id} post={post} />
                }
                else if(post.media_type == 'CAROUSEL_ALBUM') {
                  return <InstagramCarousel key={post.id} post={post} />
                }
                else {
                  return (
                    <div key={post.id}>
                      <h1><Link href={post.permalink}>{post.caption}</Link></h1>
                    </div>
                  )
                }
              })}
              </div>
          )}
          {/* <pre>{JSON.stringify(instaData,null,2)}</pre> */}
      </InstagramSection>
    );
  } 
};

const InstagramSection = ({data,children}) => {
  const className = data.textsize && data.textsize !== 'default' 
  ? `prose-${data.textsize}`
  : `prose-primary`

  return <Section color={'primary'}>
  <Container
    className={[className,proseClasses," pt-6 pb-8"].join(" ")}
    data-tina-field={tinaField(data, "body")}
    size={data.padding || "large"}
    width={data.width || 'medium'}  
  >{children}
    </Container>
    </Section>
} 
const instaPostClasses = "cover aspect-square rounded-lg w-1/4 relative"
const instaLinkClasses = "relative block overflow-hidden aspect-square rounded-t-lg"

const InstagramCaption = ({caption}) => { return (<div className="w-full h-1/3 bottom-0 p-3 rounded-b-lg bg-[#ffffff] text-richblack-700 ">
  <p >{caption}</p>
</div>) }

const InstagramImage = ({post}: {post: any}) => {
  return (
    <div key={post.id} className={instaPostClasses}>
      <Link href={post.permalink} className={instaLinkClasses}>
        <Image src={post.media_url} width={360} height={360} alt={post.caption}/>
      </Link>
      <InstagramCaption caption={post.caption}/>
    </div>
  )
}

const InstagramVideo = ({post}: {post: any}) => {
  const [play,setPlay] = useState(false)
  const videoRef = useRef(null);
  return (
    <div key={post.id} className={instaPostClasses}>
      <div className={play ? instaLinkClasses.replace('aspect-square','aspect-auto') : instaLinkClasses}>
        <Image src={post.thumbnail_url} width={360} height={360} alt={post.caption} className=""/>
        <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center z-50" onClick={() => {setPlay(p =>!p); play ? videoRef.current.pause() : videoRef.current.play() }}>
          <Icon data={{name: "BiPlay", color: "red", style: "circle", size: "medium"}} className={play ? "hidden" : ""}></Icon>      
        </div>
        <video ref={videoRef} className={`absolute top-0 left-0 w-full h-full ${play ? "autoplay": "invisible"}`} loop muted>
          <source src={post.media_url} type="video/mp4" />
        </video>
      </div>
      <InstagramCaption caption={post.caption}/>
    </div>
  )
}

const InstagramCarousel = ({post}: {post: any}) => {
  const navigationElm = ({ setActiveIndex, activeIndex, length }) => (
    <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
      {new Array(length).fill("").map((_, i) => (
        <span
          key={i}
          className={`block h-1 cursor-pointer rounded-2xl transition-all content-[''] ${
            activeIndex === i ? "w-8 bg-white" : "w-4 bg-white/50"
          }`}
          onClick={() => setActiveIndex(i)}
        />
      ))}
    </div>
  )
  return (
    <div key={post.id} className={instaPostClasses} >
      <Carousel
        className="rounded-t-lg"
        navigation={navigationElm}
        placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
      >
        { post.children.map((child: any) => {
          return (
            <div key={child.id}>
              <img src={child.media_url} width={360} height={360} alt={post.caption} className=""/>
              
            </div>
          )
        })}
      </Carousel>
      <InstagramCaption caption={post.caption}/>
    </div>
    
  )
}




export const instagramBlockSchema: Template = {
  name: "instagram",
  label: "Instagram Feed",
  ui: {
    previewSrc: "/blocks/content.png",
    defaultItem: {
      body: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.",
    },
  },
  fields: [
    {
      type: "rich-text",
      label: "Body",
      name: "body",
      templates: [
        BuyButtonTemplate as RichTextTemplate,
        CountdownElementTemplate as RichTextTemplate
      ]
    },
    {
      type: "string",
      label: "Width",
      name: "width",
      options: [
        { label: "Full Width", value: "large" },
        { label: "Thinner", value: "medium" },
        { label: "Thin", value: "small" },
      ],
    },
    {
      type: "string",
      label: "Padding",
      name: "padding",
      options: [
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Large", value: "large" },
      ],
    },
    {
      type: "string",
      label: "Text Size",
      name: "textsize",
      options: [
        { label: "Default", value: "default" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "base" },
        { label: "Large", value: "lg" },
        { label: "XL", value: "xl" },
      ],
    },
  ],
};
