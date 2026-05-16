import React from 'react';
import Sidebar from '../components/Sidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-80px)]">
      <Sidebar />
      <main className="flex-grow p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;