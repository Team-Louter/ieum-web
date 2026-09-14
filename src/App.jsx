import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DefaultLayout from "./components/default-layout/Default-Layout";
import MeetingList from "./components/Meeting/MeetingList/MeetingList";
import MeetingMakeLayout from "./components/MeetingMake/MeetingMakeLayout/MeetingMakeLayout";
import MeetingShow from "./components/MeetingShow/MeetingShowLayout/MeetingShow";
import Menubar from "./components/Menubar";

function App() {
  return (
    <Router>
      <DefaultLayout>
        <Menubar list1={'모임 보기'} list2={'내 모임'} list3={'모임 만들기'}/>
        <Routes>
          <Route path="/meeting-list" element={<MeetingList/>}/>
          <Route path="/meeting-show" element={<MeetingShow/>}/>
          <Route path="/meeting-make" element={<MeetingMakeLayout/>}/>
        </Routes>
      </DefaultLayout>
    </Router>
  )
}

export default App
