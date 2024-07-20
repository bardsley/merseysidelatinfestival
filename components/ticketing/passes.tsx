// import { CheckIcon } from '@heroicons/react/20/solid'
import { fullPassName, passes } from './pricingDefaults'
import { PassCard } from './PassCard';



export default function PassCards({setDayPass,setTypePass,setDinnerPass,priceModel,scrollToElement,selectFullPass}) {

  const clickFunctionFromPassName = (passName:string) => {

    if(/(Saturday|Sunday)/.test(passName)) {
      return () => { setDayPass(passName.split(' ')[0],true); scrollToElement()}
    } else if ( passName == "Class Pass" ) {
      return () => { setTypePass("Classes",true); scrollToElement()}
    } else if ( passName == "Party Pass" ) {
      return () => { setTypePass("Party",true); scrollToElement()}
    } else {
      return () => { setDinnerPass(true); scrollToElement()}
    }
  }  
  
  return (
    <div className="isolate overflow-hidden ">
      <div className='mb-6'>
        <h1 className='text-4xl font-bold'>Pass options</h1>
        <p>Select your pass below or tick the items you want and we&#39;ll work it out for you</p>
        
      </div>
      <div className="mx-auto grid max-w-full grid-cols-1 gap-8 lg:max-w-full md:grid-cols-3 lg:grid-cols-5 mb-12">

      
      <PassCard passName={fullPassName} clickFunction={() => { selectFullPass(); scrollToElement('fullPass')}} pass={passes[fullPassName]} priceModel={priceModel} hasASaving={true}></PassCard>

        {Object.keys(passes).filter((item)=>item !== fullPassName).map((passName) => {
          const pass = passes[passName]
          const hasSaving = priceModel == 'studentCost' ? pass.studentSaving > 0 : pass.saving > 0
          const clickFunction = clickFunctionFromPassName(passName)
          return (<PassCard passName={passName} clickFunction={clickFunction} pass={pass} priceModel={priceModel} hasASaving={hasSaving}></PassCard>)
        })}
        
      </div>
       
    </div>
  )
}
