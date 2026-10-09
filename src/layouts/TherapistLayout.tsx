import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { UserCircle, Radar, CalendarCheck, LogOut } from 'lucide-react';

export const TherapistLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Profile', path: '/freelance/profile', icon: UserCircle },
    { name: 'Job Radar', path: '/freelance/radar', icon: Radar },
    { name: 'My Jobs', path: '/freelance/jobs', icon: CalendarCheck },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCircle className="text-emerald-400" />
            Therapist Hub
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-slate-800 rounded-xl transition-colors">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
