import React from 'react';
import { Save, Shield, UserCircle } from 'lucide-react';

const UserForm = ({ 
    user, 
    setUser, 
    questionLists, 
    editingUser, 
    onSave 
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
            </h2>
            
            {/* Nama */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama
                </label>
                <input
                    type="text"
                    placeholder="Nama lengkap"
                    value={user.name}
                    onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
            </div>

            {/* Email */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                </label>
                <input
                    type="email"
                    placeholder="email@example.com"
                    value={user.email}
                    onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
            </div>

            {/* Password */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                    {editingUser && (
                        <span className="text-xs font-normal text-gray-500 ml-2">
                            (Kosongkan jika tidak ingin mengubah)
                        </span>
                    )}
                </label>
                <input
                    type="password"
                    placeholder={editingUser ? "Masukkan password baru (opsional)" : "Masukkan password"}
                    value={user.password || ''}
                    onChange={(e) => setUser(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {!editingUser && (
                    <p className="text-xs text-gray-500 mt-1">
                        Minimal 6 karakter
                    </p>
                )}
            </div>

            {/* Role Selection */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Role Pengguna
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        user.role === 'admin' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                        <input
                            type="radio"
                            name="role"
                            value="admin"
                            checked={user.role === 'admin'}
                            onChange={(e) => setUser(prev => ({ 
                                ...prev, 
                                role: e.target.value,
                                assignedListId: null
                            }))}
                            className="w-5 h-5 text-blue-600"
                        />
                        <div className="flex items-center gap-2">
                            <Shield size={20} className="text-blue-600" />
                            <span className="font-semibold text-gray-900">Admin</span>
                        </div>
                    </label>
                    
                    <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        user.role === 'user' 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                        <input
                            type="radio"
                            name="role"
                            value="user"
                            checked={user.role === 'user'}
                            onChange={(e) => setUser(prev => ({ ...prev, role: e.target.value }))}
                            className="w-5 h-5 text-green-600"
                        />
                        <div className="flex items-center gap-2">
                            <UserCircle size={20} className="text-green-600" />
                            <span className="font-semibold text-gray-900">User</span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Info untuk Admin */}
            {user.role === 'admin' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Shield size={20} className="text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-blue-900">Admin tidak memerlukan assignment</p>
                            <p className="text-xs text-blue-700 mt-1">
                                User dengan role Admin dapat mengelola semua list pertanyaan dan user.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={onSave}
                disabled={!user.name.trim() || !user.email.trim()}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold shadow-sm"
            >
                <Save size={18} /> 
                {editingUser ? 'Update' : 'Simpan'} Pengguna
            </button>
        </div>
    );
};

export default UserForm;