'use client'
import QrReader from "@components/admin/scan/QRReader"
import { useEffect, useState } from "react"
import ScanSuccessDialog from "@components/admin/scan/ScanSuccessDialog"


const ScanClient = () => {
  const [scannedResult, setScannedResult] = useState<string>('')
  const [scannerActive, setScannerActive] = useState<boolean>(true)

  useEffect(() => {
    console.log("Client noticed change")
    if (scannedResult) {
      setScannerActive(false)
    }
  }, [scannedResult])
  const debug = true
  return (
    <div className="max-w-screen-sm mx-auto ">
      {debug 
      ? <QrReader active={scannerActive} updateFunction={(value) => {setScannedResult(value)}}></QrReader> 
      : <FakeScanner/> }
      { scannerActive 
        ? <div>Scanning... {scannedResult}</div> 
        : <ScanSuccessDialog scan={scannedResult} onClick={() => {setScannerActive(true), setScannedResult('')}} />
      }
    </div>
    
  )
}


const FakeScanner = () => {
  return (<div className={`qr-reader relative aspect-[4/3]`}  suppressHydrationWarning>
    <div className="bg-richblack-600 absolute top-0 left-0 aspect-[4/3] flex justify-center items-center text-white text-xl p-2 object-cover w-full">
    Scanning Paused
    </div>
  </div>)
}

export default ScanClient