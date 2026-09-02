import DefaultLayout from "./components/default-layout/Default-Layout"
import MeetingList from "./components/Meeting/MeetingList/MeetingList"
import MeetingShow from "./components/MeetingShow/test/MeetingShow"
import Menubar from "./components/Menubar"

function App() {
  return (
    <DefaultLayout>
      <Menubar list1={'모임 보기'} list2={'내 모임'} list3={'모임 만들기'}/>
      <MeetingShow/>
      {/* <MeetingList/> */}
    </DefaultLayout>
  )
}

export default App
