'use client'
import React, { useState } from "react";

export default function DiningPageClient() {
  const [status,setStatus] = useState({} as any)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/admin/meal/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
    console.log(response)
    setStatus(response.ok ? {success: true,  message: "Emails Triggered"} : { success: false, message: "Error" })
  }

  return (
    <div>
      {JSON.stringify(status) == "{}" ? null : <p className={`w-full p-3 rounded-lg ${status.success ? "bg-green-800": "bg-red-600"}`}>{status.message}</p> }
      <button onClick={handleSubmit} className="py-3 px-6 mt-3 float-right bg-chillired-500 rounded-lg block">Trigger Meal Reminder</button>
    </div>
    
  )
}
