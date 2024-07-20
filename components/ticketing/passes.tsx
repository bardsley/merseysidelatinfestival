// import { CheckIcon } from '@heroicons/react/20/solid'
import { fullPassName, passes } from './pricingDefaults'



export default function PassCards({setDayPass,setTypePass,setDinnerPass,priceModel,scrollToElement,selectFullPass}) {
  return (
    <div className="isolate overflow-hidden ">
      <div className='mb-6'>
        <h1 className='text-4xl font-bold'>Pass options</h1>
        <p>Select your pass below or tick the items you want and we&#39;ll work it out for you</p>
        
      </div>
      <div className="mx-auto grid max-w-full grid-cols-1 gap-8 lg:max-w-full md:grid-cols-3 lg:grid-cols-5 mb-12">

      <div onClick={() => { selectFullPass(); scrollToElement('fullPass')}}
        className="flex flex-row gap-3 justify-between rounded-3xl bg-richblack-600 p-6 md:p-10 shadow-xl ring-1 ring-gray-900/10 items-start text-white hover:border border-white cursor-pointer col-span-full"
      >
        <div>
          <h3 className="font-semibold text-2xl md:text-base leading-7 text-chillired-800 uppercase w-full md:w-auto">{fullPassName}</h3>
          <p className='text-base'>{passes[fullPassName].description}</p>
        </div>
        
        <div className="flex flex-col items-baseline gap-x-2 place-content-center md:place-content-start	">
          <span className="text-3xl font-bold tracking-tight text-white">£{passes[fullPassName][priceModel]}</span>
          <span className="text-base font-semibold leading-7 text-gray-300">Saving £{priceModel == 'studentCost' ? passes[fullPassName].studentSaving : passes[fullPassName].saving}</span>
        </div>
      </div>

        {Object.keys(passes).filter((item)=>item !== fullPassName).map((passName) => {
          const pass = passes[passName]
          const saving = priceModel == 'studentCost' ? pass.studentSaving > 0 : pass.saving > 0
          const clickFunction = /(Saturday|Sunday)/.test(passName) 
            ? () => { setDayPass(passName.split(' ')[0],true); scrollToElement()} 
            : passName == "Class Pass" 
              ? () => { setTypePass("Classes",true); scrollToElement()} 
              : passName == "Party Pass" 
                ? () => { setTypePass("Party",true); scrollToElement()}
                : () => { setDinnerPass(true); scrollToElement()}

          return (
          <div
            onClick={clickFunction}
            key={passName}
            className="flex flex-col justify-between rounded-3xl bg-richblack-600 p-6 md:p-10 shadow-xl ring-1 ring-gray-900/10  text-white hover:border border-white cursor-pointer"
          >
            <div className='grid grid-cols-3 md:flex flex-wrap md:flex-nowrap md:flex-col md:justify-between'>
              <h3 id={passName} className="font-semibold text-xl md:text-base leading-7 text-chillired-800 uppercase w-full md:w-auto m-h-12">
                {passName}
              </h3>
              <div className="md:mt-4 flex items-baseline gap-x-2 place-content-center md:place-content-start	">
                <span className="text-2xl font-bold tracking-tight text-white">£{pass[priceModel]}</span>
              </div>
              { saving ? (
              <div className='mt-0 flex items-baseline gap-x-2 place-content-center	md:place-content-start'>
                <span className="text-base font-semibold leading-7 text-gray-300">Saving £{priceModel == 'studentCost' ? pass.studentSaving : pass.saving}</span>
              </div>) : null }
              <p className="md:mt-6 text-base leading-7 col-span-3 text-white">{pass.description}</p>
              {/* <ul role="list" className="mt-10 space-y-4 text-sm leading-6 text-gray-600">
                {pass.combination.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon aria-hidden="true" className="h-6 w-5 flex-none text-indigo-600" />
                    {feature}
                  </li>
                ))}
              </ul> */}
            </div>
            {/* <button
              
              aria-describedby={passName}
              className="mt-8 block rounded-md bg-chillired-600 px-3.5 py-2 text-center text-sm font-semibold leading-6  text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Select pass
            </button> */}
          </div>
        )})}
        {/* // <div className="flex flex-col items-start gap-x-8 gap-y-6 rounded-3xl p-8 ring-1 ring-gray-900/10 sm:gap-y-10 sm:p-10 lg:col-span-2 lg:flex-row lg:items-center">
        //   <div className="lg:min-w-0 lg:flex-1">
        //     <h3 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">Discounted</h3>
        //     <p className="mt-1 text-base leading-7 text-gray-600">
        //       Dolor dolores repudiandae doloribus. Rerum sunt aut eum. Odit omnis non voluptatem sunt eos nostrum.
        //     </p>
        //   </div>
        //   <a
        //     href="#"
        //     className="rounded-md px-3.5 py-2 text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        //   >
        //     Buy discounted license <span aria-hidden="true">&rarr;</span>
        //   </a>
        // </div> */}
      </div>
       
    </div>
  )
}
