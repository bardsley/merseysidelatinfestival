'use client'
// import MlfLogo from '@public/mlf-2.svg';

export default function Logo({className}) {
  // return <MlfLogo className={className} />;
  return <img src="/newcastle.png" className={`h-32 ${className ? "" : ""}`}></img>
}