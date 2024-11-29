const TimetableFooter = () => {
  return <div className="text-white text-[2vw] flex gap-[2vw] justify-end items-center">
  <p>merseysidelatinfestival.co.uk/timetable</p>
  <div className="w-[6vw] h-[6vw]" style={{backgroundImage: "url('https://kissapi-qrcode.vercel.app/api/qrcode?cht-qr&chs=200x200&chl=https%3A%2F%2Fmerseysidelatinfestival.co.uk%2Ftimetable')", backgroundPosition: "50% 50%", backgroundSize: "6.5vw 6.6vw"}}></div>
</div>
}
export default TimetableFooter