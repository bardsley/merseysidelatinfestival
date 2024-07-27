// import { CheckIcon } from '@heroicons/react/20/solid'
import { fullPassName, passes } from './pricingDefaults'
import { PassCard } from './PassCard';



export default function PassCards({setDayPass,setTypePass,setDinnerPass,priceModel,scrollToElement,selectFullPass,selected,shouldScroll}) {

  const clickFunctionFromPassName = (passName:string,setTo:boolean) => {
    if (passName == fullPassName) {
      return () => { selectFullPass(setTo); shouldScroll && scrollToElement()}
    } else if(/(Saturday|Sunday)/.test(passName)) {
      return () => { setDayPass(passName.split(' ')[0],setTo); shouldScroll && scrollToElement()}
    } else if ( passName == "Class Pass" ) {
      return () => { setTypePass("Classes",setTo); shouldScroll && scrollToElement()}
    } else if ( passName == "Party Pass" ) {
      return () => { setTypePass("Party",setTo); shouldScroll && scrollToElement()}
    } else {
      return () => { setDinnerPass(setTo); shouldScroll && scrollToElement()}
    }
  }  

  const passToDisplay = Object.keys(passes).filter((item) => passes[item].isAvailable).filter((item)=>item !== fullPassName)
  const dynamicColClasses = `md:grid-cols-3 lg:grid-cols-${passToDisplay.length}`
  return (
    <div className="isolate overflow-hidden ">
      <div className='mb-6'>
        <h1 className='text-4xl font-bold'>Pass options</h1>
        <p>Select your pass below or tick the items you want and we&#39;ll work it out for you</p>
        
      </div>
      <div className={`mx-auto grid max-w-full grid-cols-1 gap-8 lg:max-w-full mb-12 ${dynamicColClasses}`}>

      
      <PassCard passName={fullPassName} clickFunction={() => { 
        console.log('full pass',!selected.includes(fullPassName),selected)
        clickFunctionFromPassName(fullPassName,!selected.includes(fullPassName))() 
        }} pass={passes[fullPassName]} priceModel={priceModel} hasASaving={true} selected={selected.includes(fullPassName)}></PassCard>

        {passToDisplay.map((passName) => {
          const pass = passes[passName]
          const hasSaving = priceModel == 'studentCost' ? pass.studentSaving > 0 : pass.saving > 0
          const clickFunction = clickFunctionFromPassName(passName,!selected.includes(passName))
          return (<PassCard key={passName} passName={passName} clickFunction={clickFunction} pass={pass} priceModel={priceModel} hasASaving={hasSaving} selected={selected.includes(passName)}></PassCard>)
        })}
        
      </div>
       
    </div>
  )
}
