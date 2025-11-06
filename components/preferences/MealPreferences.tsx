import React, { useEffect, useState } from 'react'
import { deepCopy } from '@lib/useful'
import { Icon } from "@components/icon";
export const courses = [
  { name: "Starter", options: ["Mushroom & Truffle cake", "Chicken Liver Pate"]},
  { name: "Main", options: ["Smoked Cheese Risotto", "Chicken Supreme"]},
  { name: "Desert", options: ["Eton Mess", "Sticky Toffee Pudding"]},
]

export const blankPreferences = {choices: [-1,-1,-1], dietary_requirements : { selected: [], other: ""}, seating_preference: '', recommendations: []}
const dietaryRequirements = ["vegan","gluten free","lactose free","nut alergy","kosher","halal","other"]
const veganChoices = Object.keys(courses).map((key) => courses[key].options[0])



const MealPreferences = ({preferences,setPreferences}) =>{
  const [groupExists,setGroupExists] = useState(false)
  const choicesValid = (preferences) => preferences.choices && preferences.choices.length > 0 // Choices is and array of stuff 
  const seatingValid = (preferences) => preferences.seating_preference == '' || preferences.seating_preference.length >= 0 // Preferences is an array of stuff
  const dietValid = (preferences) => preferences.dietary_requirements && Object.keys(preferences.dietary_requirements).length > 0 // Dietary requirements is a dict of stuff
    && preferences.dietary_requirements.selected && preferences.dietary_requirements.selected.length >= 0 // Dietary requirements selected is an array or empty array
  const checkInputOk = (preferences) => {
    process.env.NEXT_PUBLIC_INTERNAL_DEBUG == 'true' && console.log(choicesValid(preferences),seatingValid(preferences),dietValid(preferences))
    return choicesValid(preferences) && seatingValid(preferences) && dietValid(preferences)
  }
  
  useEffect(() => {
    if(!checkInputOk(preferences)) {
      console.error("Preferences not ok, Reseting broken preferences to defaults")
      const origPreferences = deepCopy(preferences)
      const newPreferences = {
        choices: choicesValid(preferences)? origPreferences.choices : blankPreferences.choices, 
        dietary_requirements : dietValid(preferences)? origPreferences.dietary_requirements : blankPreferences.dietary_requirements,
        seating_preference: seatingValid(preferences)? origPreferences.seating_preference : blankPreferences.seating_preference
      }
      setPreferences(newPreferences)
    }
  })

  const setDietTo = (diet,setTo) => {
    const currentDietChoices = deepCopy(preferences.dietary_requirements.selected)
    const newDietChoices = setTo? [...currentDietChoices,diet] : currentDietChoices.filter((choice) => choice!= diet)
    setPreferences({...preferences, dietary_requirements: {...preferences.dietary_requirements, selected: newDietChoices}})
  }

  const checkGroupExistance = async (group_id) => {
    const group_response = await fetch(`/api//attendee_groups?group_id=${group_id}`,{
      method: 'GET'
    })
    console.log("Group response is",group_response,group_response.ok)
    setGroupExists(group_response.ok)
  }

  const preferencesDisabled = false
  const preferenceSent =  false

  const maintainState = (event) => {
    if(preferencesDisabled) {
      event.preventDefault()
      console.log("Locked",event)  
    }
  }

  return checkInputOk(preferences) && !preferencesDisabled ? (
    <>
      { preferenceSent ? <div className='bg-yellow-500 p-5 mt-2 text-richblack-600 font-bold rounded'>Food preferences have now been sent to the venue.</div> : null }
      
      <fieldset className="my-6 max-w-full">
        <legend className="text-base font-semibold leading-6 text-white">Course</legend>
        <div className="mt-4 divide-y divide-gray-700 border-b border-t border-gray-700">
          {courses.map((course, courseIdx) => (
            <div key={courseIdx} className="relative grid grid-cols-6 items-center md:items-start justify-between w-full py-4 flex-wrap md:flex-nowrap auto-rows-max">
              <div className="min-w-0 text-sm leading-6 w-full md:w-auto col-span-6 md:col-span-1 ">
                <span className="select-none  text-white font-bold md:font-medium">
                  {course.name}
                </span>
              </div>
              <div className="ml-3 grid grid-cols-1 sm:grid-cols-3 items-center justify-end gap-5 col-span-6 md:col-span-5">
                {course.options.map((option,optionIdx) => {
                  return (
                    <div key={`c${courseIdx}-${optionIdx}`} className={`flex items-center gap-3 justify-start cols-span-1`}>
                    
                    <input
                      id={`course-${courseIdx}-${optionIdx}`}
                      name={`course-${courseIdx}`}
                      type="radio"
                      value={optionIdx}
                      readOnly = {preferencesDisabled ? true : false}
                      defaultChecked={preferences && preferences.choices && preferences.choices[courseIdx] == optionIdx}
                      // checked={preferences[courseIdx] == optionIdx}
                      className="h-4 w-4 rounded-full border-gray-700 text-indigo-600 focus:ring-indigo-600"
                      onClick={(event) =>  maintainState(event)}
                      onChange={(event) => { preferencesDisabled ? maintainState(event): setPreferences({...preferences, choices:[...preferences.choices.slice(0,courseIdx),optionIdx,...preferences.choices.slice(courseIdx+1)]})}}
                    />
                    <label htmlFor={`course-${courseIdx}-${optionIdx}`}>{option}</label>
                    </div>
                  )
                })}
                
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      <fieldset className='my-6 max-w-full w-full'>
        <legend className="text-base font-semibold leading-6 text-white">Other Specific Dietary Requirements</legend>
        <p className='mb-3 text-sm'>Please note the food choices above, {veganChoices.join(', ').toLowerCase()} are vegan</p>

        <ul className='grid grid-cols-2 md:grid-cols-4 gap-2 mb-3'>
        {dietaryRequirements.map((diet) => {
          const dietSlug = diet.toLowerCase().replaceAll(' ','-')
          const checked = preferences.dietary_requirements.selected.includes(dietSlug)
          return (
            <li key={diet}>
              <input className="rounded mr-2" type="checkbox" name={`selected[${dietSlug}]`} id={`selected[${dietSlug}]`} defaultChecked={checked} readOnly = {preferencesDisabled ? true : false} value={dietSlug} 
                onClick={(event) =>  maintainState(event)}
                onChange={(event) => { preferencesDisabled ? maintainState(event) : setDietTo(event.target.value,event.target.checked)}}
                />{' '}
              <label htmlFor={`selected[${diet}]`} className='capitalize'>{diet}</label> 
            </li>
          )
        })}
        </ul>


        { preferences.dietary_requirements.selected.includes('other') ? (
          <div className="mt-6">
            <label htmlFor="other" className=''>Please give more details</label>
          <textarea
            id="other"
            name="other"
            defaultValue = {preferences.dietary_requirements.other}
            rows={2}
            readOnly = {preferencesDisabled ? true : false}
            onClick={(event) =>  maintainState(event)}
            onChange={(event) => {
              preferencesDisabled ? maintainState(event) : setPreferences({...preferences, dietary_requirements: {...preferences.dietary_requirements, other: event.target.value}})
            }}
            className="block w-full max-w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder='Please add details here'
          />
        </div>
        )
          : (<p className='font-sm font-light text-gray-300'>Select other if you need to provide more information</p>) }

      </fieldset>

      <div className='my-6'>
        <label htmlFor="seating_preference" className="text-base font-semibold leading-6 text-white block">
        Group Seating Code
        </label>
        <div className="mt-2 flex gap-4 items-center">
          <input
            id="seating_preference"
            name="seating_preference"
            type="text"
            placeholder="Group Name"
            aria-describedby="seating-preference"
            defaultValue = {preferences.seating_preference}
            readOnly = {preferencesDisabled ? true : false}
            onClick={(event) =>  maintainState(event)}
            onChange={(event) => {
              preferencesDisabled ? maintainState(event) : (event) => {const group_id = event.target.value
                checkGroupExistance(group_id)
                setPreferences({...preferences, seating_preference: group_id})}
            }}
            className="block w-80 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
          {preferences.seating_preference == '' ? null : groupExists
            ? <><Icon data={{name: "BiCheckCircle", color: "green", style: "regular", size: "small"}} className=""></Icon> Join &apos;{preferences.seating_preference}&apos; on checkout</>
            : <><Icon data={{name: "BiGroup", color: "blue", style: "regular", size: "small"}} className=""></Icon> Create group &apos;{preferences.seating_preference}&apos; at checkout</>
          }
        </div>
        <p id="seating-preference" className="mt-2 text-sm text-gray-300">
        Enter a code someone has given you or create a new one to share with people you want to sit with. Whilst we will endeavour to match everyone who sets a preference this cannot be guaranteed
        </p>
      </div>
      { preferences.seating_preference == '' ? null :
      <div className='mb-3'>
        <h2 className='text-xl'>Email people to join this group</h2>
        <p className='text-gray-300'>Optional: Send an email to other to get them to join your group, just type emails below with each seperated by a comma.</p>
        <input type="text" name="recommendations" key="rec-idx" id="recommendations"
          className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6' 
          defaultValue={preferences.recommendations} onChange={(event)=>{
            setPreferences({...preferences, recommendations: event.target.value.split(',').map((email) => {
              return email.trim()
            })})
          }}/>
      </div>
      }
      
    { process.env.NODE_ENV == 'development' && process.env.NEXT_PUBLIC_INTERNAL_DEBUG == 'true' ? <>
      <hr />
      <h2>Debug Ignore below the line</h2>
      <div className='flex'>
        <pre>Preferences -- {JSON.stringify(preferences,null,2)}</pre>
      </div>
      </> : null }
    </>
  ) : (
    <>
      <p className='text-sm text-gray-300'>
      Please select a meal preference to continue
      </p>
    </>
  )
}
export default MealPreferences