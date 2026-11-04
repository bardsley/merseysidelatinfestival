'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useFormStatus } from "react-dom"
import TerminalDebug from './TerminalDebug';
import Cell from '../ticketing/Cell';
import { initialSelectedOptions, fullPassName, passes, individualTickets } from '../ticketing/pricingDefaults'
import { calculateTotalCost, passOrTicket, getBestCombination, itemsFromPassCombination, itemListToOptions, addToOptions, mapItemsToAccessArray} from '../ticketing/pricingUtilities'
import PassCards from '../ticketing/passes'
import { OptionsTable } from '../ticketing/OptionsTable';
import ScanSuccessDialog from '@components/admin/scan/ScanSuccessDialog'
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
  const [ticket,setTicket] = useState(false as any)
  const [selectedAccessArray, setSelectedAccessArray] = useState([])

  const [busy, setBusy] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const polling = useRef(0);
  const attemptId = useRef<string | null>(null);
  const purchase = useRef<any>(null);
  const locked = busy || !!paymentIntentId || !!attemptId.current;

  async function terminalRequest(method: string, body?: any) {
    const response = await fetch('/api/admin/epos/terminal' + (method === 'GET' ? `?paymentIntentId=${body.paymentIntentId}` : ''), {
      method, headers: { 'Content-Type': 'application/json' },
      ...(method !== 'GET' ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json();
    if (data.paymentIntentId) setPaymentIntentId(data.paymentIntentId);
    if (!response.ok) throw new Error(data.error || 'Terminal request failed.');
    return data;
  }

  async function savePurchase(details) {
    setMessage('Saving ticket…');
    const response = await fetch('/api/admin/epos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details),
    });
    const data = await response.json();
    if (!response.ok || !data.ticket_number) throw new Error(data.error || 'Unable to save ticket.');
    setTicket(data.ticket_number);
    setPaymentIntentId(null);
    attemptId.current = null;
    purchase.current = null;
    setSelectedOptions(deepCopy(initialSelectedOptions));
    setStudentDiscount(false);
    setPriceModel('cost');
    setMessage('');
  }

  async function collectCard() {
    setBusy(true);
    const run = ++polling.current;
    try {
      setMessage('Follow the instructions on the card reader.');
      const started = await terminalRequest('POST', {
        amount: purchase.current.checkout_amount, attemptId: attemptId.current, paymentIntentId,
      });
      const id = started.paymentIntentId;
      while (run === polling.current) {
        const result = await terminalRequest('GET', { paymentIntentId: id });
        if (run !== polling.current) return;
        if (result.status === 'succeeded') {
          await savePurchase({ ...purchase.current, checkout_session: id });
          break;
        }
        if (result.status === 'canceled') {
          setPaymentIntentId(null);
          attemptId.current = null;
          purchase.current = null;
          setMessage('Payment canceled.');
          break;
        }
        if (result.failure) throw new Error(result.failure);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      setMessage(`${error.message} Use Retry / check payment to continue without starting a new charge.`);
    } finally {
      setBusy(false);
    }
  }

  async function cancelCard() {
    setBusy(true);
    try {
      if (!paymentIntentId) throw new Error('Use Retry / check payment to recover the payment before canceling.');
      await terminalRequest('DELETE', { paymentIntentId });
      polling.current++;
      setPaymentIntentId(null);
      attemptId.current = null;
      purchase.current = null;
      setMessage('Payment canceled.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  const togglePriceModel = () => {
    if (locked) return;
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

    //! Connor's suggestion + Adam's ammends
    const combinedPackages = suggestedPackages.flatMap((pass)=>{
      return passes[pass]?.combination ? passes[pass].combination : []
    })
    const selectedStrings = Object.keys(selectedOptions).flatMap((day) => {
      return Object.keys(selectedOptions[day]).flatMap((option) => {
        return selectedOptions[day][option] ? `${day} ${option}` : []
      })
    })
    // append the access array from combinedPackages and selectedStrings, ignoring duplicates for now it is handled in function
    const accessArray = mapItemsToAccessArray([...combinedPackages, ...selectedStrings])
    setSelectedAccessArray(accessArray)
    console.log([...combinedPackages, ...selectedStrings])
    console.log(selectedAccessArray)
  }

  const setIndividualOption = (day,passType) => {
    if (locked) return;
    let initialOptions = selectedOptions
    initialOptions[day][passType] =!initialOptions[day][passType]
    setSelectedOptions({...initialOptions})
  }

  const clearOptions = () => {
    if (locked) return;
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

  function CheckoutButtons() {
    const { pending } = useFormStatus();
    const activeButtonClass = `disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg py-3 px-8 \
    bg-green-700 hover:bg-green-800 text-xl text-nowrap w-full max-w-72 md:w-auto`
    return(
      <div className='flex gap-6'>
        <button type="submit" name="checkout-button" id="checkout-button" value="cash" disabled={pending || locked || totalCost <= 0}
          className={activeButtonClass}>
          {pending ? "Storing..." : "Cash"}
        </button>
        <button type="submit" name="checkout-button" value="card" disabled={pending || locked || totalCost <= 0} className={activeButtonClass}>Card</button>
      </div>

    );
  }

  async function checkout(formObject) {

    if (locked) return;

    // Generate line items for each pass/ticket
    const line_items = packages.map(passName => {
      const line_item = passes[passName] ? passes[passName] : individualTickets[passName.split(" ")[0]][passName.split(" ")[1]]
      if (line_item) {
        return {
          'amount_total': Math.round((studentDiscount ? line_item.studentCost : line_item.cost) * 100),
          'description': passName,
          'price_id': studentDiscount ? line_item.studentPriceId : line_item.priceId,
        }
      } else {
        return { 'amount_total': 0, 'description': passName, 'price_id': "broken", }
      }
    })
    // Record the sale
    console.log("selectedOptions",selectedOptions)
    const purchaseObj = {
      'email': formObject.get("inperson-email"),
      'full_name': formObject.get("inperson-name"),
      'purchase_date': getUnixTime(new Date()) ,
      'line_items': line_items,
      'access': selectedAccessArray, //! use selectedAccessArray instead
      'status': `paid_${formObject.get('checkout-button')}`,
      'student_ticket': studentDiscount,
      'checkout_session': formObject.get('checkout-button'),
      'checkout_amount': Math.round(packageCost*100),
      'heading_message':"THANK YOU FOR YOUR PURCHASE",
      'send_standard_ticket': true,
    }
    purchase.current = purchaseObj;
    if (formObject.get('checkout-button') === 'card') {
      attemptId.current = crypto.randomUUID();
      await collectCard();
    } else {
      setBusy(true);
      try { await savePurchase(purchaseObj); }
      catch (error) { setMessage(error.message); }
      finally { setBusy(false); }
    }
  }

  const cellClasses = 'border border-gray-600 text-center py-2 px-3 md:py-2 md:px-4 ';
  const headerClasses = cellClasses.replaceAll('border-gray-600','border-chillired-400')
  const toggleCellClasses = "bg-richblack-600 text-white " +  cellClasses
  const inputClasses = "w-full mb-3 rounded-md border border-gray-600 p-2 bg-gray-50 text-gray-900 w-full\
    focus:border-chillired-400 focus:ring-chillired-400"

  return (
    <div className="table-container w-full grid max-w-full lg:mx-auto col-span-5
    grid-cols-1 gap-3 justify-center text-xs
    md:grid-cols-4  md:pt-12 md:mx-3 md:text-base
      ">
        { ticket ? <div className='fixed z-50 w-full'><ScanSuccessDialog scan={ticket} onClick={()=>{setTicket(false); console.log("Checkin")}}/></div> : null }
      <h1 className="bg-chillired-500 text-white col-span-3 md:col-span-full block font-bold text-xl p-3 mt-2 rounded-lg">Till</h1>
      <div className='col-span-1'>
        <PassCards
          currentSelectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          selected={packages}
          priceModel={priceModel}
          scrollToElement={scrollToElement}
          shouldScroll={false}
          basic={true}
          locked={locked}
          ></PassCards>

        <div className='mb-12'>
          <Cell option={{name: 'Student Ticket (Check Student ID)', cost: 0, studentCost: 0, isAvailable: true } }
            isSelected={studentDiscount} onSelect={togglePriceModel} studentDiscount={studentDiscount} locked={locked}/>
        </div>
      </div>

      <div className="col-span-3">
      <OptionsTable headerClasses={headerClasses}
        toggleCellClasses={toggleCellClasses}
        cellClasses={cellClasses}
        selectedOptions={selectedOptions}
        clearOptions={clearOptions}
        setIndividualOption={setIndividualOption}
        priceModel={priceModel}
        locked={locked}

      />

      <div className="mx-auto w-full  max-w-2xl  items-start mt-10 mb-10 rounded-lg border border-gray-900 bg-gray-50 text-richblack-700 shadow-lg">

      { priceModel === 'studentCost' && totalCost && totalCost > 0 ? (
          <div className='rounded-t-md border-t-gray-600 border border-b-0 border-l-0 border-r-0 bg-gold-500 p-2 font-bold text-center'>This is a student only ticket deal!</div>)
        : null }

        <div className="px-6 pt-4" aria-live="polite">
          {message && <p role="status">{message}</p>}
          {paymentIntentId && <p className="text-xs mt-2">Payment reference: {paymentIntentId}</p>}
          {locked && !busy && <div className="flex gap-4 mt-3">
            <button type="button" className="underline" onClick={collectCard}>Retry / check payment</button>
            <button type="button" className="underline" onClick={cancelCard}>Cancel card payment</button>
          </div>}
          {paymentIntentId && busy && <button type="button" className="underline block mt-3" onClick={cancelCard}>Cancel card payment</button>}
        </div>

        <div className='flex flex-col md:flex-row justify-between pb-10 px-10 pt-6 gap-3'>
          { totalCost > 0 ? (
            <>
              <div className='max-w-2/3 md:w-1/3'>
                <h2 className='text-xl leading-none'>{packages.map((packageName) => `${packageName} ${passOrTicket(packageName)}`).join(', ').replace('Saturday Dinner Ticket','Dinner Ticket')}</h2>
                <h2 className='text-3xl font-bold'>{ totalCost - packageCost > 0 ? (<span className='line-through'>£{totalCost}</span>) : null } £{packageCost}</h2>
              </div>
              <form autoComplete="off" action={checkout} className='flex w-full md:w-2/3 flex-col items-center justify-center'>
                <input type="hidden" name="inperson-amount" value={Math.round(packageCost*100)} />
                <input type="text" autoComplete="off" name="inperson-name" placeholder="Name" required readOnly={locked} className={inputClasses} />
                <input type="email" autoComplete="off" name="inperson-email" placeholder="Email" required readOnly={locked} className={inputClasses}   />
                <CheckoutButtons></CheckoutButtons>
              </form>

            </>
          ) : "Select options in the table above to see the suggested packages" }
        </div>


      </div>
      </div>

      <TerminalDebug paymentIntentId={paymentIntentId} selection={{ selectedOptions, packages, packageCost, studentDiscount }} onReaderReleased={() => {
        polling.current++;
        setBusy(false);
        setMessage('Reader action stopped. Use Retry / check payment to check or resume this sale.');
      }} />

    </div>
  )
};

export default Till;
