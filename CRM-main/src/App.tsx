
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import QuoteBuilder from './components/QuoteBuilder';
import DemoScheduler from './components/DemoScheduler';
import LeadManagement from './components/LeadManagement';
import SalesPipeline from './components/SalesPipeline';
import InventoryCatalog from './components/InventoryCatalog';
import AfterSalesService from './components/AfterSalesService';
import CampaignManager from './components/CampaignManager';
import ShowroomList from './components/ShowroomList';
import UserManagement from './components/UserManagement';
import LiveChat from './components/LiveChat';
import ProfilePage from './components/ProfilePage';
import SystemConfig from './components/SystemConfig';
import LoginPage from './components/LoginPage';
import ReportCenter from './components/ReportCenter';
import TargetSetting from './components/TargetSetting';
import { User, DashboardWidgetConfig } from './types';
import { MOCK_DASHBOARD_CONFIG } from './mockData';

const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Dashboard Visibility State (Shared)
  const [dashboardConfigs, setDashboardConfigs] = useState<DashboardWidgetConfig[]>(MOCK_DASHBOARD_CONFIG);
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageParams, setPageParams] = useState<any>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPageParams(null);
  };

  const handlePageChange = (page: string, params?: any) => {
    setCurrentPage(page);
    if (params) {
      setPageParams(params);
    } else {
      setPageParams(null);
    }
  };

  const updateDashboardConfigs = (newConfigs: DashboardWidgetConfig[]) => {
      setDashboardConfigs(newConfigs);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handlePageChange} widgetConfigs={dashboardConfigs} />;
      case 'reports':
        return <ReportCenter />;
      case 'target-setting':
        return <TargetSetting />;
      case 'pipeline':
        return <SalesPipeline onNavigate={handlePageChange} />;
      case 'quotes':
        return <QuoteBuilder />;
      case 'demos':
        return <DemoScheduler initialParams={pageParams} />;
      case 'leads':
        return <LeadManagement />;
      case 'inventory':
        return <InventoryCatalog />;
      case 'service':
        return <AfterSalesService initialParams={pageParams} />;
      case 'showrooms':
        return <ShowroomList />;
      case 'campaigns':
        return <CampaignManager />;
      case 'users':
        return <UserManagement />;
      case 'chat':
        return <LiveChat onNavigate={handlePageChange} />;
      case 'profile':
        return currentUser ? <ProfilePage user={currentUser} onLogout={handleLogout} /> : <Dashboard widgetConfigs={dashboardConfigs} />;
      // Configuration Sub-pages
      case 'config-forms': 
        return <SystemConfig activeTab="FORMS" dashboardWidgets={dashboardConfigs} onUpdateDashboardConfigs={updateDashboardConfigs} />;
      case 'config-dashboard':
        return <SystemConfig activeTab="DASHBOARD" dashboardWidgets={dashboardConfigs} onUpdateDashboardConfigs={updateDashboardConfigs} />;
      case 'config-regional':
        return <SystemConfig activeTab="REGIONAL" dashboardWidgets={dashboardConfigs} onUpdateDashboardConfigs={updateDashboardConfigs} />;
      case 'config':
        return <SystemConfig activeTab="FORMS" dashboardWidgets={dashboardConfigs} onUpdateDashboardConfigs={updateDashboardConfigs} />;
      default:
        return <Dashboard onNavigate={handlePageChange} widgetConfigs={dashboardConfigs} />;
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={(page) => handlePageChange(page)}
      user={currentUser}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
