import { useState } from 'react';
import { Link } from 'react-router-dom';
import adminIcon from '../assets/admin-icon.jpg';
import type { AdminTab } from './adminTabs';

interface AdminSidebarProps {
  tabs: AdminTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onLogout: () => void;
}

export default function AdminSidebar({ tabs, activeTabId, onSelectTab, onLogout }: AdminSidebarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const selectTab = (id: string) => {
    onSelectTab(id);
    setIsMenuOpen(false);
  };

  return (
    <aside className="admin-sidebar">
      <button
        className="admin-menu-toggle"
        type="button"
        aria-label="Abrir menú"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        ☰
      </button>
      <nav className={`admin-nav ${isMenuOpen ? 'open' : ''}`} aria-label="Navegación de administración">
        <div className="admin-brand">
          <img src={adminIcon} alt="" className="admin-brand-icon" />
          <span>Panel admin</span>
        </div>
        <ul>
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                className={`admin-nav-button ${tab.id === activeTabId ? 'active' : ''}`}
                onClick={() => selectTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="admin-nav-footer">
          <Link to="/">← Volver a la tienda</Link>
          <button type="button" className="admin-nav-button" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </nav>
    </aside>
  );
}
