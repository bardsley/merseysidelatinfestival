import React from 'react';
import { fullPassName } from './pricingDefaults';

export const PassCard = ({passName, clickFunction, pass, priceModel, hasASaving, selected, included, basic}:
  {passName:string, clickFunction:any, pass:any, priceModel:string, hasASaving:boolean, selected:boolean, included?:boolean, basic?:boolean}
) => {
  const cardWidthClasses = passName === fullPassName ? 'col-span-full' : basic ? 'flex-col': 'md:flex-col'
  const passPadding = basic ? 'p-4 md:p-4' : 'p-6 md:p-10'
  const baseTextSize = basic ? 'text-sm md:text-sm' : 'text-xl md:text-base'
  const priceTextSize = basic ? 'text-sm md:text-sm leading-7' : 'text-4xl md:text-4xl'
  const hoverClasses = selected ? "border-white cursor-pointer" : included ? 'hover:border-richblack-500 cursor-not-allowed' : 'hover:border-white cursor-pointer'
  return (
    <div
      onClick={clickFunction}
      key={passName}
      title={passName}
      className={`relative flex flex-col justify-between rounded-3xl bg-richblack-600 ${passPadding} shadow-xl 
      ring-1 ring-gray-900/10  text-white border border-richblack-500 ${hoverClasses} ${cardWidthClasses}`}
    >
      <div className={`grid grid-cols-3 gap-2 md:flex flex-wrap md:flex-nowrap md:justify-between h-full w-full ${cardWidthClasses}`}>

        <div className='col-span-2'>
          
          <h3 id={passName} className={`${baseTextSize} leading-7 text-chillired-800 font-black uppercase w-full md:w-auto col-span-2 m-h-12`}>
            {passName}
          </h3>
          
          {basic ? null : <p className="mt-2 text-sm md:text-base leading-7 col-span-3 text-white">
            {pass.description} {included ? "included" : "not included"}
          </p> }

        </div>
        

        <div className={`flex ${ basic ? "flex-row justify-end": "flex-col" } items-baseline gap-x-2 place-content-center md:place-content-start col-start-3 col-span-1`}>
          <span className={`${priceTextSize} font-bold tracking-tight text-white`}>
            £{pass[priceModel] % 1 != 0 ? pass[priceModel].toFixed(2) : pass[priceModel]}
          </span>
          {hasASaving && !basic? (
          <div className="mt-0 flex items-baseline gap-x-2 place-content-center	md:place-content-start">
            <span className="text-base font-semibold leading-7 text-gold-500">
            Save  £{priceModel == "studentCost" ? (pass.studentSaving % 1 != 0 ? pass.studentSaving.toFixed(2) : pass.studentSaving) : (pass.saving % 1 != 0 ? pass.saving.toFixed(2) : pass.saving)} {included ? "included" : ""}  
            </span>
          </div>
        ) : null}
        </div>
        
        
        
      </div>
      { selected ? 
          basic ? <div className='w-full h-full opacity-90 bg-richblack-700 absolute left-0 top-0 rounded-3xl flex flex-col items-center justify-center'>Selected</div> 
            : <div className={`w-full h-full opacity-90 bg-richblack-700 absolute left-0 top-0 rounded-3xl flex flex-col items-center justify-center ${passPadding}`}>
                <h2 className='font-bold text-3xl leading-tight'>Currently Selected</h2>
              <p>This is the best deal for your choices</p>
        </div> : null }

        { !selected && included ? 
          basic ? <div className='w-full h-full opacity-95 bg-richblack-700 absolute left-0 top-0 rounded-3xl flex flex-col items-center justify-center'>Included</div> 
            : <div className={`w-full h-full opacity-95 bg-richblack-700 absolute left-0 top-0 rounded-3xl flex flex-col items-center justify-center ${passPadding}`}>
                <h2 className='font-bold text-gray-400 text-3xl'>Included</h2>
              <p className='text-gray-500'>This item is included in your selection</p>
        </div> : null }
    </div>
  );
};