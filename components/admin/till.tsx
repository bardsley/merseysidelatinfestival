'use client'
import React, { useState, useEffect } from 'react';
import { useFormStatus } from "react-dom"
import Cell from '../ticketing/Cell';
import { initialSelectedOptions, fullPassName, passes, individualTickets } from '../ticketing/pricingDefaults'
import { calculateTotalCost, passOrTicket, getBestCombination, itemsFromPassCombination, itemListToOptions, addToOptions, thingsToAccess} from '../ticketing/pricingUtilities'
import PassCards from '../ticketing/passes'
import { OptionsTable } from '../ticketing/OptionsTable';
import { useRouter } from 'next/navigation'
import { deepCopy } from '@lib/useful'
import { getUnixTime } from 'date-fns';
import symmetricDifference from 'set.prototype.symmetricdifference'
import difference from 'set.prototype.difference'
symmetricDifference.shim();
difference.shim();


const Till = ({fullPassFunction,scrollToElement}:{fullPassFunction?:Function,scrollToElement?:Function}) => {
  const [selectedOptions, setSelectedOptions] = useState(deepCopy(initialSelectedOptions));
  const [studentDiscount, setStudentDiscount] = useState(false);
  const [priceModel, setPriceModel] = useState("cost")
  const [totalCost, setTotalCost] = useState(0);
  const [packages,setPackages] = useState([])
  const [packageCost, setPackageCost] = useState(0)
  const router = useRouter()

  const togglePriceModel = () => {
    setPriceModel(priceModel === "cost"? "studentCost" : "cost")
    setStudentDiscount(priceModel === "cost" ? true : false) //! This looks backwards but priceModel hasn't changed yet
  }

  const selectFullPass = (setTo) => {
    let initialOptions = selectedOptions
    const itemsInPassName = itemsFromPassCombination([fullPassName]) as string[]
    setSelectedOptions(addToOptions(initialOptions,itemListToOptions(itemsInPassName,setTo)))
  }

  const selectPassCombination = () => {
    const {price: suggestedCost, options: suggestedPackages} = getBestCombination(selectedOptions,priceModel)
    console.log(`Suggested packages: ${suggestedPackages.join(', ')} - £${suggestedCost}`)
    setPackageCost(suggestedCost)
    setPackages(suggestedPackages)
  }

  const setIndividualOption = (day,passType) => {
    let initialOptions = selectedOptions
    initialOptions[day][passType] =!initialOptions[day][passType]
    setSelectedOptions({...initialOptions})
  }

  const clearOptions = () => {
    console.log("Options reset to: ", initialSelectedOptions)
    localStorage.removeItem("selectedOptions")
    setSelectedOptions(deepCopy(initialSelectedOptions))
  }

  useEffect(() => {
    setTotalCost(calculateTotalCost(selectedOptions,priceModel))
    selectPassCombination()
  }, [selectedOptions,priceModel,fullPassFunction])
  
  useEffect(() => {
    if(fullPassFunction) { fullPassFunction(() => selectFullPass) }
  },[])

  function CheckoutButton() {
    const { pending } = useFormStatus();
    return (
      <button type="submit" disabled={pending} 
        className='bg-chillired-400 text-white rounded-lg py-3 px-4 hover:bg-chillired-700 text-xl text-nowrap w-full max-w-72 md:w-auto'>
        {pending ? "Storing..." : "Finish Sale"}
      </button>

    );
  }

  async function checkout(formObject) {
    setSelectedOptions(deepCopy(initialSelectedOptions))
    setStudentDiscount(false)

    // Generate line items for each pass/ticket
    const line_items = packages.map(passName => {
      const line_item = passes[passName] ? passes[passName] : individualTickets[passName.split(" ")[0]][passName.split(" ")[1]]
      if (line_item) {
        return {
          'amount_total': studentDiscount ? line_item.cost * 100 : line_item.studentCost * 100,
          'description': passName,
          'price_id': studentDiscount ? line_item.studentPriceId : line_item.priceId,
        }
      } else {
        return { 'amount_total': 0, 'description': passName, 'price_id': "broken", }
      }
    })
    // Record the sale
    const purchaseObj = {
      'email': formObject.get("inperson-name"),      
      'full_name': formObject.get("inperson-email"),
      'purchase_date': getUnixTime(new Date()) ,
      'line_items': line_items,
      'access': thingsToAccess(selectedOptions),
      'status': "paid_cash",
      'student_ticket': studentDiscount,
    //   // 'promo_code': None|{
    //   //     'code': "MLF",
    //   //     'value': 500
    //   // },
    //  // 'meal_preferences': None|{},
    //  // 'checkout_session': None|"cs_xxxxxx", 
    //  // 'schedule': {},
      'heading_message':"THANK YOU FOR YOUR PURCHASE",
      'send_standard_ticket': true,
      }
    // const apiResponse = fetch(process.env.LAMBDA_CREATE_TICKET, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(purchaseObj),
    // })
    console.log("Purchase object",purchaseObj)
    router.push("/admin/epos") //TODO This 100% needs a check for errors
  }
  
  const cellClasses = 'border border-gray-600 text-center py-2 px-3 md:py-2 md:px-4 ';
  const headerClasses = cellClasses.replaceAll('border-gray-600','border-chillired-400')
  const toggleCellClasses = "bg-richblack-600 text-white " +  cellClasses 
  const inputClasses = "w-full mb-3 rounded-md border border-gray-600 p-2 bg-gray-50 text-gray-900 w-full\
    focus:border-chillired-400 focus:ring-chillired-400"

  return (
    <div className="table-container w-full grid grid-cols-1 gap-3 md:grid-cols-4 justify-center md:pt-12 max-w-full lg:mx-auto md:mx-3 col-span-5 text-xs md:text-base">
      <div className='col-span-1'>
        <PassCards 
          currentSelectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          selected={packages} 
          priceModel={priceModel} 
          scrollToElement={scrollToElement} 
          shouldScroll={false}
          basic={true}
          ></PassCards>
        
        <div className='mb-12'>
          <Cell option={{name: 'Student Ticket (Check Student ID)', cost: 0, studentCost: 0, isAvailable: true } }
            isSelected={studentDiscount} onSelect={togglePriceModel} studentDiscount={studentDiscount} />
        </div>
      </div>
      
      <div className="col-span-3">
      <OptionsTable headerClasses={headerClasses}
        toggleCellClasses={toggleCellClasses}
        cellClasses={cellClasses}
        selectedOptions={selectedOptions}
        clearOptions={clearOptions}
        setIndividualOption={setIndividualOption}
        priceModel={priceModel} />
      
      <div className="mx-auto w-full  max-w-2xl  items-start mt-10 mb-10 rounded-lg border border-gray-900 bg-gray-50 text-richblack-700 shadow-lg">
      { priceModel === 'studentCost' && totalCost && totalCost > 0 ? (
          <div className='rounded-t-md border-t-gray-600 border border-b-0 border-l-0 border-r-0 bg-gold-500 p-2 font-bold text-center'>This is a student only ticket deal!</div>) 
        : null }
        <div className='flex flex-col md:flex-row justify-between p-10 gap-3'>
          { totalCost && totalCost > 0 ? (
            <>
              <div className='max-w-2/3 md:w-1/3'>
                <h2 className='text-xl leading-none'>{packages.map((packageName) => `${packageName} ${passOrTicket(packageName)}`).join(', ').replace('Saturday Dinner Ticket','Dinner Ticket')}</h2>
                <h2 className='text-3xl font-bold'>{ totalCost - packageCost > 0 ? (<span className='line-through'>£{totalCost}</span>) : null } £{packageCost}</h2>
              </div>
              <form autoComplete="off" action={checkout} className='flex w-full md:w-2/3 flex-col items-center justify-center'>
                <input type="text" autoComplete="off" name="inperson-name" placeholder="Name" className={inputClasses} />
                <input type="text" autoComplete="off" name="inperson-email" placeholder="Email" className={inputClasses}   />
                <CheckoutButton></CheckoutButton>
              </form>
              
            </>
          ) : "Select options in the table above to see the suggested packages" }
        </div>


      </div>
      </div>
      
      
      

      { process.env.NODE_ENV == 'development' && process.env.NEXT_PUBLIC_INTERNAL_DEBUG == 'true' ? 
        <div className='col-span-full'>
        <hr />
        <h2>Debug Ignore below the line</h2>
        <div className='flex'>
          <pre>Selected -- {JSON.stringify(selectedOptions,null,2)}</pre>
          <pre>Packages--{JSON.stringify(packages,null,2)}</pre>
        </div>
        </div> : null }      
      
    </div>
  )
};

export default Till; 
