'use client'
import { useSearchParams } from 'next/navigation'

export default function NavMobile({ navs }: { navs: any }) {
  const searchParams = useSearchParams()
  const draft = searchParams.get('draft')
  const filteredNavs = draft ? navs : navs.filter((item)=>{return item.visible})
  return (
    <div className="mt-6 flow-root">
      <div className="-my-6 divide-y divide-gray-500/10">
        <div className="space-y-2 py-6">
          {filteredNavs.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${item.visible ? "text-white" : "text-gray-400"}  hover:bg-richblack-600`}
            >
              {item.label} { item.visible ? null : "draft"}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}