"use client";
import React, { useState, useRef, useEffect} from "react";

import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { Template } from "tinacms";
import { PageBlocksInstagram } from "@tina/__generated__/types";
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
import Carousel from 'react-multi-carousel';
import "react-multi-carousel/lib/styles.css";

const responsive = {
  mobile: {
    breakpoint: { max: 16000, min: 0 },
    items: 1,
    slidesToSlide: 1
  }
};
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
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-start mt-12">
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
const instaPostClasses = "cover aspect-square rounded-lg relative col-span-1"
const instaLinkClasses = "relative block overflow-hidden aspect-square rounded-t-lg"
const instaMediaClasses = "w-full"

const InstagramCaption = ({caption}) => { return (<div className="w-full bottom-0 rounded-b-lg bg-[#ffffff] text-xl sm:text-sm px-6 pt-4 pb-2 h-auto text-richblack-700 ">
  <p >{caption}</p>
</div>) }

const shrinkCaption = (caption) => {
  if(caption.length > 200) {
    // split the post
    const splitCaption = caption.split("\n")
    let newCaption = ""
    splitCaption.forEach((line) => {
      if(newCaption.length<200) { newCaption = newCaption + line }
     })
    return newCaption
  }
  else {
    return caption
  }
}
const InstagramImage = ({post}: {post: any}) => {
  return (
    <div key={post.id} className={instaPostClasses}>
      <Link href={post.permalink} className={instaLinkClasses}>
        <Image src={post.media_url} width={360} height={360} alt={post.caption} className={instaMediaClasses}/>
      </Link>
      <InstagramCaption caption={shrinkCaption(post.caption)}/>
    </div>
  )
}

const InstagramVideo = ({post}: {post: any}) => {
  const [play,setPlay] = useState(false)
  const videoRef = useRef(null);
  
  useEffect(()=>{
    if(play) {
      setTimeout(() => videoRef.current.play(),200)
    }
    else {
      videoRef.current.pause()
    }
  },[play])

  return (
    <div key={post.id} className={instaPostClasses}>
      <div className={play ? instaLinkClasses.replace('aspect-square','aspect-auto') : instaLinkClasses}>
        <Image src={post.thumbnail_url} width={360} height={360} alt={post.caption} className={instaMediaClasses}/>
        <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center z-50" onClick={() => {setPlay(p =>!p); play ? videoRef.current.pause() : videoRef.current.play() }}>
          <Icon data={{name: "BiPlay", color: "red", style: "circle", size: "medium"}} className={play ? "hidden" : ""}></Icon>      
        </div>
        <video ref={videoRef} className={`absolute top-0 left-0 w-full h-full ${play ? "": "invisible"}`} loop>
          <source src={post.media_url} type="video/mp4" />
        </video>
      </div>
      <InstagramCaption caption={shrinkCaption(post.caption)}/>
    </div>
  )
}

const InstagramCarousel = ({post}: {post: any}) => {
  
  return (
    <div key={post.id} className={instaPostClasses} >
      <Carousel
        className={instaMediaClasses + " rounded-t-lg"}
        responsive={responsive}
        showDots={true}
        infinite={true}
      >
        { post.children.map((child: any) => {
          return (
            <div className="w-full h-full" key={child.id}>
              <img src={child.media_url} width={360} height={360} alt={post.caption} className={instaMediaClasses}/>
              
            </div>
          )
        })}
      </Carousel>
      <InstagramCaption caption={shrinkCaption(post.caption)}/>
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
