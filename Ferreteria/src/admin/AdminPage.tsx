import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import AdminSidebar from './AdminSidebar';
import { tabsAllowedFor } from './adminTabs';
import { usePermissions } from '../auth/PermissionsContext';
import './admin.css';

export default function AdminPage() {
  const { logout } = useAuth0();
  const { permissions } = usePermissions();
  const allowedTabs = tabsAllowedFor(permissions);
  const [chosenTabId, setChosenTabId] = useState<string | null>(null);
  const activeTab = allowedTabs.find((tab) => tab.id === chosenTabId) ?? allowedTabs[0];
  const ActivePanel = activeTab?.Panel;

  return (
    <div className="admin-layout">
      <AdminSidebar
        tabs={allowedTabs}
        activeTabId={activeTab?.id ?? ''}
        onSelectTab={setChosenTabId}
        onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      />
      <main className="admin-content">{ActivePanel ? <ActivePanel /> : <p>No tienes permisos de administración.</p>}</main>
    </div>
  );
}
