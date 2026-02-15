import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Trophy, Clock, BookOpen, Settings, LogOut, UserCog } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { useAuth } from '../App';
import { useState } from 'react';
import ProfileModal from './ProfileModal';

const NAV_ITEMS = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/teams', icon: Users, label: 'My Teams' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/legacy', icon: Clock, label: 'Legacy' },
  { path: '/rules', icon: BookOpen, label: 'Rules' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const allItems = user?.is_admin
    ? [...NAV_ITEMS, { path: '/admin', icon: Settings, label: 'Admin' }]
    : NAV_ITEMS;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background pt-16">

        {/* ── Unified Top Nav (desktop + mobile) ── */}
        <header className="fixed top-0 left-0 right-0 z-50 glass shadow-sm h-16 flex items-center px-4 md:px-6" data-testid="top-nav">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => navigate('/home')}>
            <img
              src="https://images.vexels.com/media/users/3/134963/isolated/preview/7521d9cc865d48ec2dfb2a8a6286c13e-bridge-circle-icon-03.png"
              alt="Steel Sons Golf"
              className="h-8 w-8 md:h-10 md:w-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-heading font-bold text-sm md:text-lg tracking-tight text-[#1B4332] leading-tight">STEEL SONS GOLF</span>
              <span className="text-[6px] md:text-[8px] font-bold text-[#0F172A] tracking-wider leading-none">BLAST FURNACE OF CHAMPIONS</span>
            </div>
          </div>

          {/* Nav links — icon-only on mobile, icon+label on large screens */}
          <nav className="flex items-center gap-0.5 md:gap-1 ml-auto">
            {allItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <button
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                      onClick={() => navigate(item.path)}
                      className={`flex flex-col md:flex-row items-center gap-0.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                        active ? 'bg-[#1B4332] text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 md:w-4 md:h-4 flex-shrink-0 ${active ? 'stroke-[2.5]' : ''}`} />
                      {/* Label: tiny on mobile, full on desktop */}
                      <span className="text-[9px] md:text-sm leading-none md:leading-normal">
                        {item.label.split(' ').pop()}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{item.label}</TooltipContent>
                </Tooltip>
              );
            })}

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <button data-testid="nav-profile" onClick={() => setProfileOpen(true)}
                  className="flex flex-col md:flex-row items-center gap-0.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all">
                  <UserCog className="w-4 h-4" />
                  <span className="text-[9px] md:text-sm leading-none md:leading-normal hidden md:inline">{user?.name?.split(' ')[0]}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Profile</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button data-testid="nav-logout" onClick={handleLogout}
                  className="flex flex-col md:flex-row items-center gap-0.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-red-500 hover:bg-red-50 transition-all">
                  <LogOut className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Log Out</TooltipContent>
            </Tooltip>
          </nav>
        </header>

        {/* Page Content */}
        <main>
          <Outlet />
        </main>
      </div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </TooltipProvider>
  );
}
