import React, { useEffect } from 'react'

export const courses = [
  { name: "Starter", options: ["Vegan Tart", "Meat on Toast"]},
  { name: "Main", options: ["Pasta", "Meat and Veg"]},
  { name: "Desert", options: ["Fruit Tart", "Gelatine"]},
]

export const blankPreferences = {choices: [-1,-1,-1], dietary_requirements : { selected: [], other: ""}, seating_preference: []}
const dietaryRequirements = ["None","Vegan","Gluten free","Lactose free","Nut alergy","Kosher","Halal","Other"]
const veganChoices = Object.keys(courses).map((key) => courses[key].options[0])

const MealPreferences = ({preferences,setPreferences}) =>{

  const checkInputOk = (preferences) => {
    const choicesValid = preferences.choices && preferences.choices.length > 0 // Choices is and array of stuff
    const seatingValid = preferences.seating_preference && preferences.seating_preference.length >= 0 // Preferences is an array of stuff
    const dietValid = preferences.dietary_requirements && Object.keys(preferences.dietary_requirements).length > 0 // Dietary requirements is a dict of stuff
    && preferences.dietary_requirements.selected && preferences.dietary_requirements.selected.length >= 0 // Dietary requirements selected is an array or empty array
    && (!preferences.dietary_requirements.selected.includes('other') || preferences.dietary_requirements.other) // Dietary requirements other is a string or empty string
    return choicesValid && seatingValid && dietValid
  }
  
  useEffect(() => {
    if(!checkInputOk(preferences)) {
      console.log("Preferences not ok, Reseting")
      setPreferences(blankPreferences)
    }
  })

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

        <select name="dietary-requirements" id="dietary-requirements" multiple defaultValue={preferences.dietary_requirements.selected}
          onChange={(event) => {
            // const showAdditional = event.target.value == 'other' ? true : false
            // setShowAdditionalDiet(showAdditional)
            setPreferences({...preferences, dietary_requirements: {...preferences.dietary_requirements, selected: event.target.value}})
          }}
          className="my-2 block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">

          {dietaryRequirements.map((diet) => {
            return (
              <option key={diet} value={diet.toLowerCase().replaceAll(' ','-')}>{diet}</option>
            )
          } )}

        </select>

        { preferences.dietary_requirements.selected == 'other' ? (
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
      
      {/* { process.env.NODE_ENV == 'development' ? <>
      <hr />
      <h2>Debug Ignore below the line</h2>
      <div className='flex'>
        <pre>Preferences -- {JSON.stringify(preferences,null,2)}</pre>
      </div>
      </> : null } */}
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