import { DivideIcon } from "@heroicons/react/24/outline"


export default function ClientForm(props) {
  const {hasCookie, ticket} = props
  if(hasCookie) {
    return (
      <form action="">
        <h1>Submit Meal preferences</h1>
        <form action="/api/session" method="DELETE" encType="multipart/form-data">
          <button>Change Ticket</button>
        </form>
      </form>
    )
  } else {
    return (
      <div className="test">
        <h1 className="text-2xl">Attendee Details</h1>
        <p>Please provide your attendee details to submit preferences</p>
        <form action="/api/session" method="POST" encType="multipart/form-data" className="flex flex-col gap-4">
          <input type="text" id="ticket" defaultValue={"new"}/>
          <input type="email" id="email" defaultValue={"adam.bardsley@gmail.com"}/>
          <button type="submit">Login</button>
        </form>
      </div>)
  }
  
}