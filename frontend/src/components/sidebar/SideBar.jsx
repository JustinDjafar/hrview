// utils/sidebar/SideBar.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  BookOpenCheck, 
  FileVideo2, 
  TvMinimal,
  BadgeCheck,
  LogOut,
  Briefcase
} from "lucide-react";
import { useAuth } from '../../hooks/useAuth';

export default function SideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/home' },
    { id: 'jobs-vacancy', label: 'Jobs Vacancy', icon: Briefcase, path: '/jobs-vacancy' },
  ];

  if (!loading && user) {
    if (user.role === 'admin') {
      menuItems.push({ id: 'interview-result', label: 'Interview Result', icon: TvMinimal, path: '/interview-result' });
      menuItems.push({ id: 'match-candidates', label: 'Matching Candidates', icon: BadgeCheck, path: '/match-candidates' });
      menuItems.push({ id: 'admin-dashboard', label: 'Admin Dashboard', icon: FileVideo2, path: '/admin-video' });
    } else if (user.role === 'user') {
      menuItems.push({ id: 'interview-result-user', label: 'Interview Result', icon: TvMinimal, path: '/interview-result-user' });
      menuItems.splice(2, 0, { id: 'video-interview', label: 'Video Interview', icon: FileVideo2, path: '/user/video-interview' });
    }
  }

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  return (
    <div className="w-24 h-screen fixed top-0 left-0" style={{ backgroundColor: '#C6EBC5' }}>
      <div className="flex flex-col h-full p-6">
        {/* Navigation Menu */}
                        <nav className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 text-gray-600`}
              >
                <div className="flex flex-col items-center">
                  <div className={`${isActive ? 'bg-white shadow-md text-[#A0C878] px-3 py-1 rounded-full' : 'hover:bg-white hover:bg-opacity-50 px-3 py-1 rounded-full'}`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-medium text-center mt-1">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
        <div className="mt-auto"> {/* Use mt-auto to push to the bottom */}
          <button
            onClick={handleLogout}
            className="w-full flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 text-gray-600"
          >
            <div className="flex flex-col items-center">
              <div className="hover:bg-white hover:bg-opacity-50 px-3 py-1 rounded-full">
                <LogOut size={20} />
              </div>
              <span className="text-xs font-medium text-center mt-1">Logout</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}