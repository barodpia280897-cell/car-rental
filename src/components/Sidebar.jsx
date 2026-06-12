import React from 'react';
import { useSelector } from 'react-redux';
import AdminSidebar from './sidebars/AdminSidebar';
import OperationsSidebar from './sidebars/OperationsSidebar';
import DriverSidebar from './sidebars/DriverSidebar';
import CustomerSidebar from './sidebars/CustomerSidebar';

const Sidebar = ({ onMenuClick }) => {
  const { user, role } = useSelector(state => state.auth);

  if (!user) return null;

  switch (role) {
    case 'ADMIN':
      return <AdminSidebar onMenuClick={onMenuClick} />;
    case 'OPERATIONS':
      return <OperationsSidebar onMenuClick={onMenuClick} />;
    case 'DRIVER':
      return <DriverSidebar onMenuClick={onMenuClick} />;
    case 'CUSTOMER':
      return <CustomerSidebar onMenuClick={onMenuClick} />;
    default:
      return <AdminSidebar onMenuClick={onMenuClick} />;
  }
};

export default Sidebar;
