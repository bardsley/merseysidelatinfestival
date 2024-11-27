const TimetableFooter = () => {
  return <div className="text-white text-4xl flex gap-6 justify-end items-center">
  <p>merseysidelatinfestival.co.uk/timetable</p>
  <div className="w-[100px] h-[100px]" style={{backgroundImage: "url('https://kissapi-qrcode.vercel.app/api/qrcode?cht-qr&chs=200x200&chl=https%3A%2F%2Fmerseysidelatinfestival.co.uk%2Ftimetable')", backgroundPosition: "50% 50%", backgroundSize: "115px 115px"}}></div>
</div>
}
export default TimetableFooter