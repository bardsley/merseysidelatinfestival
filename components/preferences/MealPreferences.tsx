import React, { useEffect } from 'react'
import { deepCopy } from '../../lib/useful'
export const courses = [
  { name: "Starter", options: ["Vegan Tart", "Meat on Toast"]},
  { name: "Main", options: ["Pasta", "Meat and Veg"]},
  { name: "Desert", options: ["Fruit Tart", "Gelatine"]},
]

export const blankPreferences = {choices: [-1,-1,-1], dietary_requirements : { selected: [], other: ""}, seating_preference: []}
const dietaryRequirements = ["vegan","gluten free","lactose free","nut alergy","kosher","halal","other"]
const veganChoices = Object.keys(courses).map((key) => courses[key].options[0])

const MealPreferences = ({preferences,setPreferences}) =>{

  const choicesValid = (preferences) => preferences.choices && preferences.choices.length > 0 // Choices is and array of stuff 
  const seatingValid = (preferences) => preferences.seating_preference && preferences.seating_preference.length >= 0 // Preferences is an array of stuff
  const dietValid = (preferences) => preferences.dietary_requirements && Object.keys(preferences.dietary_requirements).length > 0 // Dietary requirements is a dict of stuff
    && preferences.dietary_requirements.selected && preferences.dietary_requirements.selected.length >= 0 // Dietary requirements selected is an array or empty array
  const checkInputOk = (preferences) => {
    console.log(choicesValid(preferences),seatingValid(preferences),dietValid(preferences))
    return choicesValid(preferences) && seatingValid(preferences) && dietValid(preferences)
  }
  
  useEffect(() => {
    if(!checkInputOk(preferences)) {
      console.log("Preferences not ok, Reseting")
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

  return checkInputOk(preferences) ? (
    <>
      <fieldset className="my-6 max-w-full">
        <legend className="text-base font-semibold leading-6 text-white">Course</legend>
        <div className="mt-4 divide-y divide-gray-700 border-b border-t border-gray-700">
          {courses.map((course, courseIdx) => (
            <div key={courseIdx} className="relative flex items-center md:items-start justify-between w-full py-4 flex-wrap md:flex-nowrap">
              <div className="min-w-0 text-sm leading-6 w-full md:w-auto ">
                <span className="select-none  text-white font-bold md:font-medium">
                  {course.name}
                </span>
              </div>
              <div className="ml-3 flex flex-1 h-6 items-center justify-end gap-5">
                {course.options.map((option,optionIdx) => {
                  return (
                    <div key={`c${courseIdx}-${optionIdx}`} className="flex items-center gap-2 w-36 justify-end">
                    <label htmlFor={`course-${courseIdx}-${optionIdx}`}>{option}</label>
                    <input
                      id={`course-${courseIdx}-${optionIdx}`}
                      name={`course-${courseIdx}`}
                      type="radio"
                      value={optionIdx}
                      defaultChecked={preferences && preferences.choices && preferences.choices[courseIdx] == optionIdx}
                      // checked={preferences[courseIdx] == optionIdx}
                      className="h-4 w-4 rounded-full border-gray-700 text-indigo-600 focus:ring-indigo-600"
                      onChange={() => setPreferences({...preferences, choices:[...preferences.choices.slice(0,courseIdx),optionIdx,...preferences.choices.slice(courseIdx+1)]})
                        
                      }
                    />
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

        <ul className='grid grid-cols-2 md:grid-cols-4 gap-2'>
        {dietaryRequirements.map((diet) => {
          const checked = preferences.dietary_requirements.selected.includes(diet)
          const value = diet.toLowerCase().replaceAll(' ','-')
          return (
            <li key={diet}>
              <input className="rounded mr-2" type="checkbox" name={`selected[${diet}]`} id={`selected[${diet}]`} defaultChecked={checked} value={value} onChange={(event) => {
                console.log(event.target.value)
                setDietTo(event.target.value,event.target.checked)}}
                />{' '}
              <label htmlFor={`selected[${diet}]`} className='capitalize'>{diet}</label> 
            </li>
          )
        })}
        </ul>


        { preferences.dietary_requirements.selected.includes('other') ? (
          <div className="mt-2">
          <textarea
            id="other"
            name="other"
            defaultValue = {preferences.dietary_requirements.other}
            rows={2}
            onChange={(event) => {
              setPreferences({...preferences, dietary_requirements: {...preferences.dietary_requirements, other: event.target.value}})
            }}
            className="block w-full max-w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder='Please add details here'
          />
        </div>
        )
          : (<p className='font-sm font-light text-gray-300'>Select other if you need to provide more information</p>) }

      </fieldset>
      
      <div className='my-6'>
        <label htmlFor="email" className="text-base font-semibold leading-6 text-white block">
        Seating
        </label>
        <div className="mt-2">
          <input
            id="seating_preference"
            name="seating_preference"
            type="text"
            placeholder="171653467, 12987619"
            aria-describedby="seating-preference"
            defaultValue = {preferences.seating_preference.join(', ')}
            onChange={(event) => {
              setPreferences({...preferences, seating_preference: event.target.value.split(',')})
            }}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <p id="seating-preference" className="mt-2 text-sm text-gray-300">
        Whilst we will endeavour to match everyone who sets a preference this cannot be guaranteed
        </p>
      </div>
      
      { process.env.NODE_ENV == 'development' && process.env.DEBUG == 'true' ? <>
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