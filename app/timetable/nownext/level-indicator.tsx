import { levels } from "@tina/collection/sessionLevels"

const LevelIndicator = () => {

  const publicLevels = ["advanced",  "intermediate",  "improver",  "beginner", "all"]

  return <div className="grow flex items-center justify-stretch my-[0.3vw] text-black">
    {publicLevels.map((levelName)=>{
      return <div key={levelName} className="flex uppercase grow items-center justify-center text-[1.4vw] py-[1vw] font-bold" style={{backgroundColor: levels[levelName].colour}}>{levels[levelName].title}</div>
    })}
  </div>
  
}
export default LevelIndicator