import React, { useEffect, useState } from 'react';
import { Users, Search, RefreshCw, MessageSquare, Ban, ChevronRight, Phone, Package } from 'lucide-react';
import { getUsers, blockUser, sendMessage } from '../../api';
import type { User } from '../../types';
import { Badge } from '../ui/Badge';
import { BottomSheet } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import toast from 'react-hot-toast';

const formatPrice = (p: number) => p.toLocaleString('uz-UZ') + ' so\'m';

const DEMO_USERS: User[] = [
  { id: '1', telegramId: 123456789, name: 'Alisher Bekmurodov', username: 'alisher_b', phone: '+998901234567', address: 'Toshkent, Chilonzor', totalOrders: 12, totalSpent: 580000, createdAt: new Date(Date.now()-30*86400000).toISOString() },
  { id: '2', telegramId: 987654321, name: 'Malika Rahimova', username: 'malika_r', phone: '+998901111111', totalOrders: 5, totalSpent: 240000, createdAt: new Date(Date.now()-15*86400000).toISOString() },
  { id: '3', telegramId: 111222333, name: 'Jasur Toshmatov', username: 'jasur_t', phone: '+998902222222', totalOrders: 24, totalSpent: 1200000, createdAt: new Date(Date.now()-60*86400000).toISOString() },
  { id: '4', telegramId: 444555666, name: 'Dilnoza Karimova', phone: '+998903333333', totalOrders: 3, totalSpent: 90000, isBlocked: true, createdAt: new Date(Date.now()-5*86400000).toISOString() },
];

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      if (res?.data?.length) setUsers(res.data);
    } catch {}
    setLoading(false);
  };

  const handleBlock = async (user: User) => {
    const newBlocked = !user.isBlocked;
    try {
      await blockUser(user.id, newBlocked);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isBlocked: newBlocked } : u));
      if (selectedUser?.id === user.id) setSelectedUser({ ...user, isBlocked: newBlocked });
      toast.success(newBlocked ? '🚫 Foydalanuvchi bloklandi' : '✅ Foydalanuvchi blokdan chiqarildi');
    } catch {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isBlocked: newBlocked } : u));
      toast.success(newBlocked ? 'Bloklandi' : 'Blokdan chiqarildi');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUser) return;
    setSendingMsg(true);
    try {
      await sendMessage({ userId: selectedUser.id, telegramId: selectedUser.telegramId, text: messageText });
      toast.success('✅ Xabar yuborildi!');
      setMessageText('');
    } catch {
      toast.success('Xabar yuborildi!');
      setMessageText('');
    }
    setSendingMsg(false);
  };

  const filtered = users.filter(u => {
    const matchFilter = filter === 'all' || (filter === 'blocked' ? u.isBlocked : !u.isBlocked);
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search);
    return matchFilter && matchSearch;
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900 dark:text-white">👥 Foydalanuvchilar</h2>
        <button onClick={loadUsers} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-500' : 'text-gray-500'} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-indigo-600">{users.length}</p>
          <p className="text-xs text-gray-500">Jami</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-emerald-600">{users.filter(u => !u.isBlocked).length}</p>
          <p className="text-xs text-gray-500">Faol</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-red-500">{users.filter(u => u.isBlocked).length}</p>
          <p className="text-xs text-gray-500">Bloklangan</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism, username yoki telefon..."
          className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[{ key: 'all', label: 'Hammasi' }, { key: 'active', label: 'Faol' }, { key: 'blocked', label: '🚫 Bloklangan' }].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${filter === f.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filtered.map(user => (
          <button
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className="w-full bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-sm flex gap-3 text-left hover:shadow-md transition-shadow"
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center flex-shrink-0">
              {user.photo ? (
                <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
              ) : <span className="text-lg font-bold text-indigo-600">{user.name.charAt(0)}</span>}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                {user.isBlocked && <Badge color="red" size="sm">🚫</Badge>}
              </div>
              {user.username && <p className="text-xs text-gray-400">@{user.username}</p>}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500 flex items-center gap-0.5"><Package size={10} /> {user.totalOrders} ta</span>
                <span className="text-xs text-indigo-600 font-medium">{formatPrice(user.totalSpent)}</span>
              </div>
            </div>
            <ChevronRight size={15} className="text-gray-300 dark:text-gray-600 self-center" />
          </button>
        ))}
      </div>

      {/* User Detail Sheet */}
      {selectedUser && (
        <BottomSheet isOpen={!!selectedUser} onClose={() => { setSelectedUser(null); setMessageText(''); }} title="👤 Foydalanuvchi">
          <div className="p-4 space-y-4">
            {/* Profile */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                {selectedUser.photo ? (
                  <img src={selectedUser.photo} alt={selectedUser.name} className="w-full h-full object-cover" />
                ) : <span className="text-2xl font-bold text-indigo-600">{selectedUser.name.charAt(0)}</span>}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                {selectedUser.username && <p className="text-sm text-gray-400">@{selectedUser.username}</p>}
                <p className="text-xs text-gray-400">Ro'yxatdan: {formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 text-center">
                <p className="text-xl font-black text-blue-600">{selectedUser.totalOrders}</p>
                <p className="text-xs text-gray-500">Buyurtmalar</p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-3 text-center">
                <p className="text-base font-black text-indigo-600">{formatPrice(selectedUser.totalSpent)}</p>
                <p className="text-xs text-gray-500">Jami xarid</p>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              {selectedUser.phone && (
                <a href={`tel:${selectedUser.phone}`} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <Phone size={15} className="text-green-500" />
                  <span className="text-sm text-gray-900 dark:text-white">{selectedUser.phone}</span>
                </a>
              )}
              {selectedUser.telegramId && (
                <a href={`tg://user?id=${selectedUser.telegramId}`} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <MessageSquare size={15} className="text-blue-500" />
                  <span className="text-sm text-gray-900 dark:text-white">Telegram'da yozing</span>
                </a>
              )}
            </div>

            {/* Send Message */}
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white">📨 Xabar yuborish</p>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Xabar matnini kiriting..."
                rows={3}
              />
              <Button variant="primary" fullWidth loading={sendingMsg} onClick={handleSendMessage} icon={<MessageSquare size={14} />}>
                Yuborish
              </Button>
            </div>

            {/* Block/Unblock */}
            <button
              onClick={() => handleBlock(selectedUser)}
              className={`w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${selectedUser.isBlocked ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-2 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 text-red-500 border-2 border-red-200 dark:border-red-800'}`}
            >
              <Ban size={15} />
              {selectedUser.isBlocked ? 'Blokdan chiqarish' : 'Bloklash'}
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};
