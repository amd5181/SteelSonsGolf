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
      <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-16">
        {/* Desktop Top Nav */}
        <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 glass shadow-sm h-16 items-center px-6" data-testid="desktop-nav">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/home')}>
            <img 
              src="https://images.vexels.com/media/users/3/134963/isolated/preview/7521d9cc865d48ec2dfb2a8a6286c13e-bridge-circle-icon-03.png" 
              alt="Steel Sons Golf" 
              className="h-10 w-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg tracking-tight text-[#1B4332] leading-tight">STEEL SONS GOLF</span>
              <span className="text-[8px] font-bold text-[#0F172A] tracking-wider leading-none">BLAST FURNACE OF CHAMPIONS</span>
            </div>
          </div>
          <nav className="flex items-center gap-1 ml-auto">
            {allItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <button
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active ? 'bg-[#1B4332] text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button data-testid="nav-profile" onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
                  <UserCog className="w-4 h-4" />
                  <span className="hidden lg:inline">{user?.name?.split(' ')[0]}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Profile</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button data-testid="nav-logout" onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
                  <LogOut className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Log Out</TooltipContent>
            </Tooltip>
          </nav>
        </header>

        {/* Mobile Top Bar */}
        <header className="md:hidden fixed top-0 left-0 right-0 z-50 glass shadow-sm h-14 flex items-center px-4 justify-between" data-testid="mobile-top-bar">
          <div className="flex items-center gap-2" onClick={() => navigate('/home')}>
            <img 
              src="https://images.vexels.com/media/users/3/134963/isolated/preview/7521d9cc865d48ec2dfb2a8a6286c13e-bridge-circle-icon-03.png" 
              alt="Steel Sons Golf" 
              className="h-8 w-8 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-heading font-bold text-sm tracking-tight text-[#1B4332] leading-tight">STEEL SONS GOLF</span>
              <span className="text-[6px] font-bold text-[#0F172A] tracking-wider leading-none">BLAST FURNACE OF CHAMPIONS</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button data-testid="mobile-profile" onClick={() => setProfileOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
              <UserCog className="w-5 h-5 text-slate-600" />
            </button>
            <button data-testid="mobile-logout" onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-50">
              <LogOut className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="pt-14 md:pt-0">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass shadow-[0_-2px_10px_rgba(0,0,0,0.06)] flex items-center justify-around h-16 px-1" data-testid="mobile-nav">
          {allItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <button
                    data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                    onClick={() => navigate(item.path)}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[52px] ${
                      active ? 'text-[#1B4332]' : 'text-slate-400'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                    <span className="text-[10px] font-semibold leading-none">{item.label.split(' ').pop()}</span>
                    {active && <div className="w-4 h-0.5 rounded-full bg-[#CCFF00] mt-0.5" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </TooltipProvider>
  );
}
