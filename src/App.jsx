import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DefaultLayout from "./components/default-layout/Default-Layout";
import MeetingShow from "./pages/MeetingShow/MeetingShow";
import MeetingMakeLayout from "./pages/MeetingMake/MeetingMakeLayout";
import MeetingMy from "./pages/MeetingMy/MeetingMy";
import Menubar from "./components/Menubar";
import MeetingMyMemberList from './pages/MeetingMyMemberList/MeetingMyMembers';
import MeetingAnnouncementMake from './pages/MeetingAnnouncementMake/MeetingAnnouncementMake';
import MeetingManagement from './pages/MeetingManagement/MeetingManagement';

function App() {
  return (
    <Router>
      <DefaultLayout>
        <Menubar
          list1={'모임 보기'}
          list2={'내 모임'}
          list3={'모임 만들기'}
          path1="/meeting-show"
          path2="/meeting-my"
          path3="/meeting-make"
        />
        <Routes>
          <Route path="/meeting-show" element={<MeetingShow/>}/>
          <Route path="/meeting-my" element={<MeetingMy/>}/>
          <Route path="/meeting-make" element={<MeetingMakeLayout/>}/>
          <Route path="/meeting-my-member-list" element={<MeetingMyMemberList/>}/>
          <Route path="/meeting-announcement-make" element={<MeetingAnnouncementMake/>}/>
          <Route path="/meeting-management" element={<MeetingManagement/>}/>
        </Routes>
      </DefaultLayout>
    </Router>
  )
}

export default App
