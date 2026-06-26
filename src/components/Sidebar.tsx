import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Network, 
  Route, 
  Home, 
  Footprints, 
  AlertTriangle, 
  Shield,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AccessRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: AccessRole;
  setUserRole: (role: AccessRole) => void;
  pendingCount: number;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  userRole, 
  setUserRole,
  pendingCount
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Indicadores', icon: LayoutDashboard },
    { id: 'people', label: 'Membros & Frequentadores', icon: Users },
    { id: 'territory', label: 'Organização Territorial', icon: Network },
    { id: 'journey', label: 'Jornada & Cursos', icon: Route },
    { id: 'families', label: 'Famílias', icon: Home },
    { id: 'visits', label: 'Visitas', icon: Footprints },
    { 
      id: 'pendencies', 
      label: 'Pendências Inteligentes', 
      icon: AlertTriangle,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
  ];

  return (
    <aside 
      className={`bg-slate-50 border-r border-slate-200 h-screen sticky top-0 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      id="main-sidebar"
    >
      {/* Top Header */}
      <div>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm tracking-wide">
                JC
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 text-sm leading-tight">Johrei Center</span>
                <span className="text-xs text-slate-500 font-mono">Caraguatatuba</span>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs mx-auto">
              JC
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-150 transition-colors focus:outline-none"
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
            id="btn-toggle-sidebar"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 relative ${
                  isActive 
                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isCollapsed ? item.label : undefined}
                id={`btn-tab-${item.id}`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                
                {item.badge !== undefined && (
                  <span className={`absolute ${isCollapsed ? 'top-1 right-1' : 'right-3'} flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Role Switcher */}
      <div className="p-3 border-t border-slate-200 bg-slate-100/60">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1 text-xs font-semibold text-slate-500 tracking-wider uppercase">
              <Shield size={12} className="text-slate-400" />
              <span>Nível de Acesso</span>
            </div>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/60 rounded-md">
              <button
                onClick={() => setUserRole('ADMIN')}
                className={`py-1 text-center text-xs font-medium rounded transition-all duration-150 ${
                  userRole === 'ADMIN' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="btn-role-admin"
              >
                Admin
              </button>
              <button
                onClick={() => setUserRole('AM')}
                className={`py-1 text-center text-xs font-medium rounded transition-all duration-150 ${
                  userRole === 'AM' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="btn-role-am"
              >
                AM (Dani)
              </button>
            </div>
            <div className="text-[11px] text-slate-400 px-1 italic">
              {userRole === 'ADMIN' 
                ? 'Acesso completo a todas as funções e setores.' 
                : 'Filtro automático: Vendo apenas o setor CENTRO-NORTE.'}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setUserRole(userRole === 'ADMIN' ? 'AM' : 'ADMIN')}
            className="w-10 h-10 rounded-full mx-auto bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors"
            title={`Alternar para ${userRole === 'ADMIN' ? 'Assistente de Ministro' : 'Administrador'}`}
            id="btn-role-toggle-collapsed"
          >
            <Shield size={18} className={userRole === 'ADMIN' ? 'text-emerald-600' : 'text-amber-600'} />
          </button>
        )}
      </div>
    </aside>
  );
}
