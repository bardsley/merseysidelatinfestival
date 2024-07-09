import { TinaMarkdown, TinaMarkdownContent } from "tinacms/dist/rich-text";

const BuyButton = (props: {description: TinaMarkdownContent, buttonid: string}) => {
  return (
    <div className="flex flex-col justify-between gap-12 w-full md:flex-row text-center md:text-left">      
      <div>
        <TinaMarkdown content={props.description}/>
      </div>
      <div>
        <script async={true} src="https://js.stripe.com/v3/buy-button.js"></script>
        {/* @ts-ignore */}
        <stripe-buy-button buy-button-id={props.buttonid} publishable-key="pk_live_51N2dADEWkmdeWsQPYeTNPSstoERl8teNlua8cL6vN73CR6sd6qEoYTIv0AEH2jpYiA02WpABzBTFYVTW2efJs8du00zTZjxG9h" />
      </div>
    </div>
  )
}


export default BuyButton;