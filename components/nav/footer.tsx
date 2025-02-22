"use client";
import React from "react";
import { cn } from "../../lib/utils";
import { Container } from "../layout/container";
import Link from "next/link";
// import { Icon } from "../icon";
import { FaFacebook, FaGithub, FaTwitter, FaYoutube } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { useLayout } from "../layout/layout-context";
// import { RawRenderer } from "../raw-renderer";

export default function Footer() {
  // const { theme, globalSettings, pageData } = useLayout();
  const { theme, globalSettings } = useLayout();
  const footer = globalSettings?.footer;

  
  const socialIconClasses = "h-10 w-auto";
  const socialIconColorClasses = {
    blue: "text-blue-500 dark:text-blue-400 hover:text-blue-300",
    teal: "text-teal-500 dark:text-teal-400 hover:text-teal-300",
    green: "text-green-500 dark:text-green-400 hover:text-green-300",
    red: "text-red-500 dark:text-red-400 hover:text-red-300",
    pink: "text-pink-500 dark:text-pink-400 hover:text-pink-300",
    purple: "text-purple-500 dark:text-purple-400 hover:text-purple-300",
    orange: "text-orange-500 dark:text-orange-400 hover:text-orange-300",
    yellow: "text-yellow-500 dark:text-yellow-400 hover:text-yellow-300",
    primary: "text-white opacity-80 hover:opacity-100",
  };

  const footerColor = {
    default:
      "text-gray-800 from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000",
    primary: {
      blue: "text-white from-blue-500 to-blue-700",
      teal: "text-white from-teal-500 to-teal-600",
      green: "text-white from-green-500 to-green-600",
      red: "text-white from-red-500 to-red-600",
      pink: "text-white from-pink-500 to-pink-600",
      purple: "text-white from-purple-500 to-purple-600",
      orange: "text-white from-orange-500 to-orange-600",
      yellow: "text-white from-yellow-500 to-yellow-600",
      merseyside: "text-white from-chillired-300 to-chillired-500",
    },
  };

  const footerColorCss =
    theme?.darkMode === "dark"
      ? footerColor.primary[theme.color]
      : footerColor.default;

  return (
    <footer className={cn(`bg-gradient-to-br pt-12 pb-6`, footerColorCss)}>
      <Container className="relative" size="small">
        <div className="flex justify-center items-center gap-6 flex-wrap">
          
          <div className="flex gap-4">
            {footer.social && footer.social.facebook && (
              <a
                className=" opacity-80 hover:opacity-100 transition ease-out duration-150 inline-flex items-center"
                href={footer.social.facebook}
                target="_blank"
              >
                <FaFacebook
                  className={`${socialIconClasses} ${
                    socialIconColorClasses[
                      footer.color === "primary" ? "primary" : theme.color
                    ]
                  } h-8`}
                />
              </a>
            )}
            {footer.social && footer.social.twitter && (
              <a
                className="inline-block opacity-80 hover:opacity-100 transition ease-out duration-150"
                href={footer.social.twitter}
                target="_blank"
              >
                <FaTwitter
                  className={`${socialIconClasses} ${
                    socialIconColorClasses[
                      footer.color === "primary" ? "primary" : theme.color
                    ]
                  }`}
                />
              </a>
            )}
            {footer.social && footer.social.instagram && (
              <a
                className="inline-block opacity-80 hover:opacity-100 transition ease-out duration-150"
                href={footer.social.instagram}
                target="_blank"
              >
                <AiFillInstagram
                  className={`${socialIconClasses} ${
                    socialIconColorClasses[
                      footer.color === "primary" ? "primary" : theme.color
                    ]
                  }`}
                />
              </a>
            )}
            {footer.social && footer.social.github && (
              <a
                className="inline-block opacity-80 hover:opacity-100 transition ease-out duration-150"
                href={footer.social.github}
                target="_blank"
              >
                <FaGithub
                  className={`${socialIconClasses} ${
                    socialIconColorClasses[
                      footer.color === "primary" ? "primary" : theme.color
                    ]
                  }`}
                />
              </a>
            )}
            {footer.social && footer.social.youtube && (
              <a
                className="inline-block opacity-80 hover:opacity-100 transition ease-out duration-150"
                href={footer.social.youtube}
                target="_blank"
              >
                <FaYoutube
                  className={`${socialIconClasses} ${
                    socialIconColorClasses[
                      footer.color === "primary" ? "primary" : theme.color
                    ]
                  }`}
                />
              </a>
            )}
          </div>
          {/* <RawRenderer parentColor={footer.color} rawData={pageData} /> */}
        </div>
        <div
          className={cn(
            `absolute h-1 bg-gradient-to-r from-transparent`,
            theme.darkMode === "primary"
              ? `via-white`
              : `via-black dark:via-white`,
            "to-transparent bottom-0 left-4 right-4 -z-1 opacity-5"
          )}
        />
        <div className="flex justify-center items-center gap-6 my-6 flex-col sm:flex-row">
          <div className="w-1/3 flex justify-center flex-1 ">
            <p className="text-center">
              Event organised by and related content copyright of{" "}
              <a href="http://www.salsaliverpool.com/">Salsa Liverpool</a>
            </p>
          </div>
          <div className="w-1/3 flex justify-center flex-1">
            <p className="text-center">This Event runs on Dance Engine owned by<br/>
              <a href="https://adambardsley.co.uk">Adam Bardsley</a> & Connor Monaghan
            </p>
          </div>
          <div className="w-1/3 flex flex-col justify-center text-center flex-1">
            <p className="text-center"><Link href="tos">Terms of Service</Link></p>
            <p className="text-center"><Link href="/privacy">Privacy Policy</Link></p>
          </div>
        </div>
      </Container>
      { process.env.NODE_ENV == 'development' && process.env.NEXT_PUBLIC_INTERNAL_DEBUG == 'true' ? <>
      <hr />
      <h2>Debug Ignore below the line</h2>
      <div className='flex'>
        <pre>Footer -- {JSON.stringify(footer,null,2)}</pre>
        
      </div>
      </> : null }
    </footer>
  );
}
