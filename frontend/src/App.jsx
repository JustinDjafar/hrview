import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MeetingRoom from './pages/MeetingRoom';
import Assignment from './pages/Assignment';
import Home from './pages/home/Home'
import Layout from './components/layout/Layout';
import InterviewResult from './pages/InterviewResult';
import InterviewResultUser from './pages/InterviewResultUser'; // Added this import
import InstructionPage from './pages/InstructionsPage';
import VideoInterview from './pages/VideoInterview';
import AdminDashboard from './pages/Video-Interview/admin/AdminDashboard';
import LoginPage from './pages/home/LoginPage';
import MatchingCandidates from './pages/MatchingCandidates';
import VideoInterviewUser from './pages/VideoInterviewUser';
import ProtectedRoute from './components/auth/ProtectedRoute';
import JobsVacancy from './pages/JobsVacancy';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LoginPage />} />
         <Route path="/" element={<Layout />}>
          
          <Route path="home" element={<Home />} />
          <Route path="assignment" element={<Assignment />} />
          <Route path="jobs-vacancy" element={<JobsVacancy />} />
          <Route path="instructions" element={<InstructionPage />} />
          <Route path="match-candidates" element={<MatchingCandidates />} />

          {/* Admin-only routes nested within Layout */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="interview-result" element={<InterviewResult />} /> {/* Moved here */}
            <Route path="admin/video-interview" element={<VideoInterview />} />
            <Route path="admin-video" element={<AdminDashboard />} />
          </Route>

          {/* User-only routes nested within Layout */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="interview-result-user" element={<InterviewResultUser />} /> {/* Added this route */}
            <Route path="user/video-interview" element={<VideoInterviewUser />} />
          </Route>

        </Route>
        
        {/* <Route path="admin-room" element={<AdminRoom />} /> */}
        {/* <Route path="/room" element={<Room />} /> */}
        <Route path="/room" element={<MeetingRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
