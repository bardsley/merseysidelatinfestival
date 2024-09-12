'use client'
import { useUser } from "@clerk/clerk-react";
import { authUsage } from "@lib/authorise";
import { usePathname } from 'next/navigation'
import { BiSolidHand } from "react-icons/bi";

const containerClasses = "flex w-full h-screen justify-center items-center"
const alertClasses = " border border-1 border-gray-500 rounded-md p-6 flex gap-3 items-center justify-center "

export default function AuthCheck({children}) {
  const { user, isLoaded } = useUser();
  const path = usePathname()
  
  if(path == '/admin') return children
  if (!isLoaded) { return <div className={containerClasses}><div className={alertClasses}>Permission Checking...</div></div> }
  if (!user) { return <div className={containerClasses}><div className={alertClasses}>Not Logged.</div></div> }
  if(!authUsage(user, path)) { return <div className={containerClasses }><div className={alertClasses + ` text-chillired-800 border-chillired-800`}><BiSolidHand/>Not Authorised!</div></div> }
  return children
}