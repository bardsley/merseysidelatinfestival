import { TinaMarkdown, TinaMarkdownContent } from "tinacms/dist/rich-text";

const BuyButton = (props: {description: TinaMarkdownContent}) => {
  return (
    <div className="flex justify-center gap-12">
      <div>
        <TinaMarkdown content={props.description}/>
      </div>
      <div>
        <script async={true} src="https://js.stripe.com/v3/buy-button.js"></script>
        {/* @ts-ignore */}
        <stripe-buy-button buy-button-id="buy_btn_1PX2eZEWkmdeWsQPvSMRezVD" publishable-key="pk_live_51N2dADEWkmdeWsQPYeTNPSstoERl8teNlua8cL6vN73CR6sd6qEoYTIv0AEH2jpYiA02WpABzBTFYVTW2efJs8du00zTZjxG9h" />
      </div>
    </div>
  )
}
{/* <script async="" src="https://js.stripe.com/v3/buy-button.js">
 </script>
 <stripe-buy-button buy-button-id="buy_btn_1PX2hYEWkmdeWsQPpM9k8WFI" publishable-key="pk_live_51N2dADEWkmdeWsQPYeTNPSstoERl8teNlua8cL6vN73CR6sd6qEoYTIv0AEH2jpYiA02WpABzBTFYVTW2efJs8du00zTZjxG9h">
 </stripe-buy-button> */}

export default BuyButton;