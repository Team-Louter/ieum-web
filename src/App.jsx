import { useState } from 'react';
import LoginPage from './pages/Loginpage/LoginPage';
import SignupPage from './pages/SignupPage/SignupPage';
import './App.css';

// 임시 커뮤니티 화면..
function CommunityPage({ onNavigate }) {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>커뮤니티 (임시 화면)</h1>
            <button onClick={() => onNavigate('login')} style={{ fontSize: '20px', padding: '10px', marginTop: '20px' }}>로그아웃</button>
        </div>
    );
}

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  if (currentPage === 'community') {
    return <CommunityPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'signup-user') {
    return <SignupPage accountType="user" onNavigate={setCurrentPage} />;
  }
  
  if (currentPage === 'signup-guardian') {
    return <SignupPage accountType="guardian" onNavigate={setCurrentPage} />;
  }

  return <LoginPage onNavigate={setCurrentPage} />;
}

export default App;