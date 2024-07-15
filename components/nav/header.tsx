"use client";

import React from "react";
import Link from "next/link";
import { Container } from "../layout/container";
import { cn } from "../../lib/utils";
import { tinaField } from "tinacms/dist/react";
import NavItems from "./nav-items";
import { useLayout } from "../layout/layout-context";
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'


const headerColor = {
  default:
    "text-black dark:text-white from-gray-50 to-white dark:from-gray-800 dark:to-gray-900",
  primary: {
    blue: "text-white from-blue-300 to-blue-500",
    teal: "text-white from-teal-400 to-teal-500",
    green: "text-white from-green-400 to-green-500",
    red: "text-white from-red-400 to-red-500",
    pink: "text-white from-pink-400 to-pink-500",
    purple: "text-white from-purple-400 to-purple-500",
    orange: "text-white from-orange-400 to-orange-500",
    yellow: "text-white from-yellow-400 to-yellow-500",
    merseyside: "text-white from-richblack-500 to-richblack-500",
  },
};

export default function Header() {
  const { globalSettings, theme } = useLayout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const header = globalSettings.header;

  const headerColorCss =
    header.color === "primary"
      ? headerColor.primary[theme.color]
      : headerColor.default;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-b ${headerColorCss}`}
    >
      <Container size="custom" className="py-0 relative z-10 max-w-8xl">
        <div className="flex items-center justify-between gap-6">
          <h4 className="select-none text-lg font-bold tracking-tight my-4 transition duration-150 ease-out transform">
            <Link
              href="/"
              className="flex gap-1 items-center whitespace-nowrap tracking-[.002em]"
            >
              {/* <Icon
                tinaField={tinaField(header, "icon")}
                parentColor={header.color}
                data={{
                  name: header.icon.name,
                  color: header.icon.color,
                  style: header.icon.style,
                }}
              /> */}
              <Logo className="w-12 h-12"></Logo>
              {" "}
              <span data-tina-field={tinaField(header, "name")} className="ml-2 hidden md:inline">
                {header.name}
              </span>
            </Link>
          </h4>
          <NavItems navs={header.nav} />
          <button 
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-150 hover:text-white md:hidden "
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <div
          className={cn(
            `absolute h-[1px] bg-gradient-to-r from-transparent`,
            theme.darkMode === "primary"
              ? `via-white`
              : `via-black dark:via-white`,
            "to-transparent bottom-0 left-4 right-4 -z-1 opacity-20"
          )}
        />
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="2xl:hidden">
         <div className="fixed inset-0 z-10" />
         <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-richblack-500 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
           <div className="flex items-center justify-between">
             <a href="#" className="-m-1.5 p-1.5">
               <span className="sr-only">Merseyside Latin festival</span>
               <Logo className="w-12 h-12"></Logo>
             </a>
             <button
               type="button"
               onClick={() => setMobileMenuOpen(false)}
               className="-m-2.5 rounded-md p-2.5 text-gray-700"
             >
               <span className="sr-only">Close menu</span>
               <XMarkIcon aria-hidden="true" className="h-6 w-6" />
             </button>
           </div>
           <div className="mt-6 flow-root">
             <div className="-my-6 divide-y divide-gray-500/10">
               <div className="space-y-2 py-6">
                 {header.nav.map((item) => (
                   <a
                     key={item.href}
                     href={item.href}
                     className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-richblack-600"
                   >
                     {item.label}
                   </a>
                 ))}
               </div>
             </div>
           </div>
         </DialogPanel>
       </Dialog>
      </Container>
    </div>
  );
}
