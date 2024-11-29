const fetcher = (url: string) => fetch(url).then((res) => res.json());

const scanIn = async (ticket_number,email,reset=false) => {
  const apiResponse = await fetch(`/api/admin/scan/${ticket_number}`,{
    method: "POST",
    body: JSON.stringify({email:email,reset: reset}),
  })
  return apiResponse.json()
}

const scanInMeal = async (ticket_number,created_at,reset=false) => {
  const apiResponse = await fetch(`/api/admin/scan/${ticket_number}`,{
    method: "POST",
    body: JSON.stringify({meal_ticket: true, created_at: created_at, reset: reset}),
  })
  return apiResponse.json()
}

export {fetcher,scanIn, scanInMeal}