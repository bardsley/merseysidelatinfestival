'use client'
import { useEffect, useRef, useState } from "react";
// import '../../../styles/qr-scanner.css'

// Qr Scanner
import QrScanner from "qr-scanner";

type Camera = {
  id: string;
  label: string;
};
const QrReader = ({updateFunction, active}: {updateFunction: (result: string) => void, active:boolean}) => {
  // QR States
  const scanner = useRef<QrScanner>();
  const videoEl = useRef<HTMLVideoElement>(null);
  const cameraSelectEl = useRef<HTMLSelectElement>(null);
  const [qrOn, setQrOn] = useState<boolean>(true);

  // Result
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera,setSelectedCamera] = useState<string>(localStorage.getItem('selectedCamera') || '');
  const [scanningPaused,setScanningPaused] = useState<boolean>(false);

  // Success
  const onScanSuccess = (result: QrScanner.ScanResult) => {
    // 🖨 Print the "result" to browser console.
    // console.log("Result",result);
    // ✅ Handle success.
    // 😎 You can do whatever you want with the scanned result.
    // scanner.current.turnFlashOn()
    // setTimeout(() => {
    //   scanner.current.turnFlashOff()
    // }, 50);
    // active && console.log("Result", new Date(), active);
    active && updateFunction(result?.data);
  };

  // *Fail* Not a real fail just mean no QR code found
  // const onScanFail = (err: string | Error) => {
  //   // 🖨 Print the "err" to browser console.
  //   console.error("Error",err);
  // };

  useEffect(() => {
    console.log("Camera Setup Initiated")
    // alert("Camera Setup Initiated")
    if (videoEl?.current && !scanner.current && selectedCamera) {
      console.log(selectedCamera)
      // alert(selectedCamera)
      // 👉 Instantiate the QR Scanner
      

      // 🚀 Start QR Scanner after a hot-second
      setTimeout(() => {
        scanner.current = new QrScanner(videoEl?.current, onScanSuccess, {
          // onDecodeError: onScanFail,
          // 📷 This is the camera facing mode. In mobile devices, "environment" means back camera and "user" means front camera.
          preferredCamera: selectedCamera, //"27b9f7688443c91358d8f9b4a9d9fc4cf36909ff46d77254bdef1f334eece7b8",
          // 🖼 This will help us position our "QrFrame.svg" so that user can only scan when qr code is put in between our QrFrame.svg.
          highlightScanRegion: true,
          // 🔥 This will produce a yellow (default color) outline around the qr code that we scan, showing a proof that our qr-scanner is scanning that qr code.
          highlightCodeOutline: true,
          // 📦 A custom div which will pair with "highlightScanRegion" option above 👆. This gives us full control over our scan region.
          // overlay: qrBoxEl?.current || undefined,
          maxScansPerSecond: 15
  
        });
        // alert("Starting the scanner")
        scanner?.current
        ?.start()
        .then(() => {setQrOn(true)})
        .catch(({name, message}) => {
          // alert(`${name} & ${message}`);
          if(name === "AbortError") { // Carry on
          } else if(name === "NotAllowedError") {
            alert(`Camera permission denied : ${message}`);
            setQrOn(false);
          } else {
            setQrOn(false);
          }
        });
      }, 300);
      
    } else {
      QrScanner.listCameras(true).then((cameras) => {
        setCameras(cameras.map((camera) => camera));
      });
    }

    // 🧹 Clean up on unmount.
    // 🚨 This removes the QR Scanner from rendering and using camera when it is closed or removed from the UI.
    return () => {
      console.log("Clean up on unmount")
      if (!videoEl?.current) {
        console.log("Remove the camera from the UI")
        scanner?.current?.stop();
      }
    };
  }, [selectedCamera]);

  // ❌ If "camera" is not allowed in browser permissions, show an alert.
  useEffect(() => {
    if (!qrOn) alert("Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload.");
  }, [qrOn]);

  useEffect(() => {
    if (selectedCamera) {
      scanner?.current?.setCamera(selectedCamera)
      localStorage.setItem("selectedCamera", selectedCamera)
    }
  }, [selectedCamera])

  useEffect(() => {
    if (scanningPaused) {
      scanner?.current?.pause();
    } else {
      scanner?.current?.start();
    }
  }, [scanningPaused])

  useEffect(()=> {
    setScanningPaused(!active)
  },[active])

  const selectClassNames = "mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
  const buttonClassnames = "rounded px-4 py-2 bg-chillired-500"
  return (
    <div className="max-w-screen-sm mx-auto">

      <div className="action-bar my-3 flex gap-3 justify-center">
        {/* 📷 Select Camera */}
        <button className={buttonClassnames} onClick={() => {setScanningPaused(!scanningPaused)}}>{ scanningPaused ? "Restart": "Pause"}</button>
        { selectedCamera ? <button className={buttonClassnames} onClick={() => {setSelectedCamera('')}}>Camera</button> :
        <select name="" id="" autoFocus ref={cameraSelectEl} className={selectClassNames} onChange={(e) => setSelectedCamera(e.target.value)}>
          <option value="">Select a camera</option>
          {cameras.map((camera) => (
            <option key={camera.id} value={camera.id}>
              {camera.label}
            </option>
          ))}
        </select>}
      </div>
      

      <div className={`qr-reader relative aspect-[4/3]`}  suppressHydrationWarning>
        {/* QR */}
        <video ref={videoEl} className={`aspect-[4/3] object-cover`}></video>
        { scanningPaused && <div className="bg-richblack-600 absolute top-0 left-0 aspect-[4/3] flex justify-center items-center text-white text-xl p-2 object-cover w-full">
        Scanning Paused
        </div>}
      </div>
      
        
        {/* Show Data Result if scan is success */}
        {/* {scannedResult && (
          <p className="bg-chillired-600 text-white w-full text-center p-2">
            Scanned: {scannedResult}
          </p>
        )} */}
    </div>
  );
  
  
};

export default QrReader;