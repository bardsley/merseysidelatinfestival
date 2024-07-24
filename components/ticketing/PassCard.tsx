import React from 'react';
import { fullPassName } from './pricingDefaults';

export const PassCard = ({passName, clickFunction, pass, priceModel, hasASaving}) => {
  const cardWidthClasses = passName === fullPassName ? 'col-span-full' : 'md:flex-col'
  return (
    <div
      onClick={clickFunction}
      key={passName}
      className={`flex flex-col justify-between rounded-3xl bg-richblack-600 p-6 md:p-10 shadow-xl ring-1 ring-gray-900/10  text-white border border-richblack-500 hover:border-white cursor-pointer ${cardWidthClasses}`}
    >
      <div className={`grid grid-cols-3 gap-2 md:flex flex-wrap md:flex-nowrap md:justify-between h-full ${cardWidthClasses}`}>

        <div className='col-span-2'>
          
          <h3 id={passName} className="text-xl md:text-base leading-7 text-chillired-800 font-black uppercase w-full md:w-auto col-span-2 m-h-12">
            {passName}
          </h3>
          
          <p className="mt-2 text-sm md:text-base leading-7 col-span-3 text-white">
            {pass.description}
          </p>

        </div>
        

        <div className="flex flex-col items-baseline gap-x-2 place-content-center md:place-content-start col-start-3 col-span-1">
          <span className="text-4xl font-bold tracking-tight text-white">
            £{pass[priceModel]}
          </span>
          {hasASaving ? (
          <div className="mt-0 flex items-baseline gap-x-2 place-content-center	md:place-content-start">
            <span className="text-base font-semibold leading-7 text-gold-500">
            Save  £{priceModel == "studentCost" ? pass.studentSaving : pass.saving}
            </span>
          </div>
        ) : null}
        </div>
        
        
        
      </div>
    </div>
  );
};