import { Textarea } from '@headlessui/react'
import React, { useState} from 'react'

const courses = [
  { name: "Starter", options: ["Vegan Tart", "Meat on Toast"]},
  { name: "Main", options: ["Pasta", "Meat and Veg"]},
  { name: "Desert", options: ["Fruit Tart", "Gelatine"]},
]

const dietaryRequirements = ["None","Vegan","Gluten free","Lactose free","Nut alergy","Kosher","Halal","Other"]
const veganChoices = Object.keys(courses).map((key) => courses[key].options[0])
const MealPreferences = ({preferences,setPreferences}) =>{

  const [showAdditionalDiet,setShowAdditionalDiet] = useState(false)
  return (
    <>
      <fieldset className="my-6">
        <legend className="text-base font-semibold leading-6 text-white">Course</legend>
        <div className="mt-4 divide-y divide-gray-700 border-b border-t border-gray-700">
          {courses.map((course, courseIdx) => (
            <div key={courseIdx} className="relative flex items-start py-4">
              <div className="min-w-0 flex-1 text-sm leading-6">
                <span className="select-none font-medium text-white">
                  {course.name}
                </span>
              </div>
              <div className="ml-3 flex h-6 items-center gap-5">
                {course.options.map((option,optionIdx) => {
                  return (
                    <div key={`c${courseIdx}-${optionIdx}`} className="flex items-center gap-2 w-36 justify-end">
                    <label htmlFor={`course-${courseIdx}-${optionIdx}`}>{option}</label>
                    <input
                      id={`course-${courseIdx}-${optionIdx}`}
                      name={`course-${courseIdx}`}
                      type="radio"
                      value={optionIdx}
                      defaultChecked={preferences && preferences[courseIdx] == optionIdx}
                      // checked={preferences[courseIdx] == optionIdx}
                      className="h-4 w-4 rounded-full border-gray-700 text-indigo-600 focus:ring-indigo-600"
                      onChange={() => setPreferences([...preferences.slice(0,courseIdx),optionIdx,...preferences.slice(courseIdx+1)])
                        
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
          {JSON.stringify(preferences)}
      <fieldset className='my-6'>
        <legend className="text-base font-semibold leading-6 text-white">Other Specific Dietary Requirements</legend>
        <p className='mb-3 text-sm'>Please note the food choices above, {veganChoices.join(', ').toLowerCase()} are vegan</p>

        <select name="dietary-requirements" id="dietary-requirements" defaultValue="None"
          onChange={(event) => {
            const showAdditional = event.target.value == 'other' ? true : false
            setShowAdditionalDiet(showAdditional)
          }}
          className="mt-2 block w-96 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">

          {dietaryRequirements.map((diet) => {
            return (
              <option key={diet} value={diet.toLowerCase().replaceAll(' ','-')}>{diet}</option>
            )
          } )}

        </select>

        { showAdditionalDiet ? (
          <div className="mt-2">
          <textarea
            id="comment"
            name="comment"
            rows={2}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder='Please add details here'
          />
        </div>
        )
          : (<p className='font-sm font-light text-gray-150'>Select other if you need to provide more information</p>) }

      </fieldset>
      
      <div className='my-6'>
        <label htmlFor="email" className="text-base font-semibold leading-6 text-white block">
        Seating
        </label>
        <div className="mt-2">
          <input
            id="seating"
            name="seating"
            type="text"
            placeholder="171653467, 12987619"
            aria-describedby="seating-preference"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <p id="seating-preference" className="mt-2 text-sm text-gray-500">
        Whilst we will endeavour to match everyone who sets a preference this cannot be guaranteed
        </p>
      </div>
      
    </>
  )
}
export default MealPreferences