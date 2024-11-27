import { levels } from "@tina/collection/sessionLevels"

const LevelIndicator = () => {

  const publicLevels = ["advanced",  "intermediate",  "improver",  "beginner", "all"]

  return <div className="grow flex justify-stretch my-3 text-black">
    {publicLevels.map((levelName)=>{
      return <div key={levelName} className="flex grow items-center justify-center text-lg font-bold" style={{backgroundColor: levels[levelName].colour}}>{levels[levelName].title}</div>
    })}
  </div>
  
}
export default LevelIndicator