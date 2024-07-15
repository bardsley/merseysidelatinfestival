import { TinaMarkdown, TinaMarkdownContent } from "tinacms/dist/rich-text";

const DiscountCode = (props: {code: string }) => {
  return (
    <div className="block text-2xl text-gold-400 border-gold-700 border-3 rounded-lg border-dashed py-3 px-6 mx-auto md:mx-0 w-fit">      
      <strong>Code: {props.code}</strong>
    </div>
  )
}

export default DiscountCode;