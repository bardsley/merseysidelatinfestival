// import { CheckIcon } from '@heroicons/react/20/solid'
import { fullPassName, passes} from './pricingDefaults'
import { PassCard } from './PassCard';
import { itemsFromPassCombination, itemListToOptions, addToOptions, passInCombination, optionsToPassArray} from './pricingUtilities'
import type { PartialSelectedOptions } from './pricingTypes'

// export default function PassCards({setDayPass,setTypePass,setDinnerPass,priceModel,scrollToElement,selectFullPass,selected,shouldScroll}) {
export default function PassCards({currentSelectedOptions, setSelectedOptions, priceModel,scrollToElement,selected,shouldScroll, basic} :
  { currentSelectedOptions:PartialSelectedOptions, 
    setSelectedOptions:any, 
    priceModel: string,
    scrollToElement:any,
    selected:any,
    shouldScroll:boolean, 
    basic?:boolean}
) {

  const clickFunctionFromPassName = (passName:string,setTo:boolean) => {
    let initialOptions = currentSelectedOptions
    const itemsInPassName = itemsFromPassCombination([passName]) as string[]
    setSelectedOptions(addToOptions(initialOptions,itemListToOptions(itemsInPassName,setTo)))
    shouldScroll && scrollToElement()
  }  

  const passToDisplay = Object.keys(passes).filter((item) => passes[item].isAvailable).filter((item)=>item !== fullPassName)
  const dynamicColClasses = basic ? 'grid-cols-1 xs:grid-cols-2' : `grid-cols-1 md:grid-cols-3 lg:grid-cols-${passToDisplay.length}`


  return (
    <div className="isolate overflow-hidden ">
      <div className='mb-6'>
      { basic ? null : <>
        <h1 className='text-4xl font-bold'>Pass options</h1> 
        <p>Select your pass below or tick the items you want and we&#39;ll work it out for you</p>
      </>}
        
      </div>
      <div className={`mx-auto grid max-w-full  ${basic ? "gap-2": "gap-8"} lg:max-w-full mb-12 ${dynamicColClasses}`}>

      
      <PassCard passName={fullPassName} basic={basic} clickFunction={() => { 
        clickFunctionFromPassName(fullPassName,!selected.includes(fullPassName))
        }} pass={passes[fullPassName]} priceModel={priceModel} hasASaving={true} selected={selected.includes(fullPassName)}></PassCard>

        {passToDisplay.map((passName) => {
          const pass = passes[passName]
          const hasSaving = priceModel == 'studentCost' ? pass.studentSaving > 0 : pass.saving > 0

          console.log("selected",selected)
          console.log("pass combination",pass.combination)
          const included = passInCombination(pass,optionsToPassArray(currentSelectedOptions))

          console.log("include",included)
          const clickFunction = () => clickFunctionFromPassName(passName,!selected.includes(passName))
          return (<PassCard key={passName} 
            basic={basic} passName={passName} pass={pass}
            clickFunction={clickFunction}  priceModel={priceModel} hasASaving={hasSaving} 
            selected={selected.includes(passName)}
            included={included}
            />)
        })}
        
      </div>
       
    </div>
  )
}
