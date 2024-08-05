import { XMarkIcon} from '@heroicons/react/20/solid'
import { BiAlarmExclamation, BiCheckCircle } from "react-icons/bi";

export default function Alert({message,type,dismissFunction}) {

  const messageClassesBase = "message py-2 pl-4 pr-2 text-white rounded-md transition ease-in-out delay-150 duration-500"
  const messageClassType = type =='good' ? 'bg-green-600' : 'bg-red-600'
  const messageIconClasses = "w-6 h-6"
  const messageClassIcon = type =='good' ? (<BiCheckCircle className={messageIconClasses}/>) : <BiAlarmExclamation className={messageIconClasses}/>
  const messageClasses = [messageClassesBase,messageClassType].join(' ')


  return (
    <div className={messageClasses}>
      <div className="flex">
        <div className="flex-shrink-0">
          {messageClassIcon}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-white">{message}</p>
        </div>
        { dismissFunction ? <div className="ml-auto pl-3" onClick={dismissFunction}>
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              className="inline-flex rounded-md bg-none p-1.5 text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </div> : null }
      </div>
    </div>
  )
}
