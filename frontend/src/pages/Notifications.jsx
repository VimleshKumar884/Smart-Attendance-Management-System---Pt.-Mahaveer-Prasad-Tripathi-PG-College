import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, Check, Info, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { getFriendlyError } from '../lib/helpers';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      setError(getFriendlyError(err, 'Could not load notifications.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications(current => current.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      showToast(getFriendlyError(err, 'Failed to mark as read.'), 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      setNotifications(current => current.map(n => ({ ...n, isRead: true })));
      showToast('All notifications marked as read.', 'success');
    } catch (err) {
      showToast(getFriendlyError(err, 'Failed to update notifications.'), 'error');
    }
  };

  if (loading) return <Spinner label="Loading notifications..." />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
            <div className="relative">
              <Bell className="text-primary" size={30} />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white"></span>}
            </div>
            Notifications
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">System alerts and updates.</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="tap-target px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <div className="space-y-3">
        {notifications.map(notification => {
          const isAlert = notification.type === 'alert';
          const isSuccess = notification.type === 'success';
          const Icon = isAlert ? AlertTriangle : isSuccess ? CheckCircle2 : Info;
          const bgClass = notification.isRead ? 'bg-white' : isAlert ? 'bg-rose-50' : isSuccess ? 'bg-emerald-50' : 'bg-blue-50';
          const borderClass = notification.isRead ? 'border-slate-200' : isAlert ? 'border-rose-200' : isSuccess ? 'border-emerald-200' : 'border-blue-200';
          const textClass = notification.isRead ? 'text-slate-500' : isAlert ? 'text-rose-600' : isSuccess ? 'text-emerald-600' : 'text-blue-600';

          return (
            <div key={notification._id} className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all ${bgClass} ${borderClass}`}>
               <div className={`p-2 rounded-full bg-white shadow-sm ${textClass}`}>
                 <Icon size={24} />
               </div>
               <div className="flex-1 pr-12">
                 <p className={`text-sm font-bold ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{notification.message}</p>
                 <p className="text-xs font-semibold text-slate-400 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
               </div>
               {!notification.isRead && (
                 <button 
                   onClick={() => handleMarkAsRead(notification._id)}
                   className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-primary shadow-sm border border-slate-200 transition"
                   title="Mark as read"
                 >
                   <Check size={16} />
                 </button>
               )}
            </div>
          )
        })}
        {notifications.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center">
            <Bell size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-600">You're all caught up!</p>
            <p className="text-sm font-medium text-slate-400 mt-1">No new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;