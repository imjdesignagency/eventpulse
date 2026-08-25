import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Building, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  Check, 
  Bell, 
  Calendar,
  Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface UserProfileModalProps {
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose }) => {
  const { userProfile, updateProfile, logout } = useAuth();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [company, setCompany] = useState(userProfile?.company || '');
  const [role, setRole] = useState<UserRole>(userProfile?.role || 'organizer');
  const [bio, setBio] = useState(userProfile?.bio || '');
  
  const [emailUpdates, setEmailUpdates] = useState(
    userProfile?.notificationPreferences?.emailUpdates ?? true
  );
  const [whatsappAlerts, setWhatsappAlerts] = useState(
    userProfile?.notificationPreferences?.whatsappAlerts ?? true
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        displayName,
        phone,
        company,
        role,
        bio,
        notificationPreferences: {
          emailUpdates,
          whatsappAlerts,
          smsReceipts: false,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Update profile error:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative bg-[#111111] text-[#E0E0E0] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#2A2A2A] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0D0D0D] p-5 sm:p-6 flex items-center justify-between border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#AA8B2E] flex items-center justify-center text-black font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-white">Account & VIP Profile</h3>
              <p className="text-xs text-[#888888] font-mono">
                UID: {userProfile?.uid?.slice(0, 16)}...
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#181818] hover:bg-[#252525] text-[#888888] hover:text-white border border-[#2E2E2E] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm bg-[#111111]">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-[#102418] border border-[#1E4D30] text-[#4ADE80] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          {/* Profile Overview Card */}
          <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40 bg-[#1A1A1A] flex-shrink-0">
                {userProfile?.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#D4AF37] font-bold text-lg font-serif">
                    {userProfile?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-base">{userProfile?.displayName}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#1D1B13] border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] font-mono font-bold uppercase">
                    {userProfile?.role === 'organizer' ? 'Host / Organizer' : 'VIP Attendee'}
                  </span>
                </div>
                <p className="text-xs text-[#888888] font-mono mt-0.5">{userProfile?.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-[#2B1717] hover:bg-[#3D1E1E] text-[#F87171] border border-[#4A2020] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Role Switching */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#CCCCCC]">Platform Mode / Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('organizer')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  role === 'organizer'
                    ? 'border-[#D4AF37] bg-[#1D1B13] text-[#D4AF37] font-bold'
                    : 'border-[#262626] bg-[#161616] text-[#888888]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs text-white">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Event Host / Organizer</span>
                </div>
                <p className="text-[10px] text-[#777777] mt-0.5">Full access to WhatsApp blast & QR scanners</p>
              </button>

              <button
                type="button"
                onClick={() => setRole('attendee')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  role === 'attendee'
                    ? 'border-[#D4AF37] bg-[#1D1B13] text-[#D4AF37] font-bold'
                    : 'border-[#262626] bg-[#161616] text-[#888888]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs text-white">
                  <User className="w-3.5 h-3.5 text-[#4ADE80]" />
                  <span>VIP Attendee / Guest</span>
                </div>
                <p className="text-[10px] text-[#777777] mt-0.5">Focus on tickets, RSVP pass & discovery</p>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Display Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 w-4 h-4 text-[#666666]" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#161616] rounded-xl border border-[#2A2A2A] text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Account Email (Immutable)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-[#666666]" />
                <input
                  type="email"
                  readOnly
                  value={userProfile?.email || ''}
                  className="w-full pl-10 pr-3 py-2 bg-[#141414] rounded-xl border border-[#222222] text-[#777777] text-xs font-mono cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">WhatsApp Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-2.5 w-4 h-4 text-[#666666]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#161616] rounded-xl border border-[#2A2A2A] text-white font-mono text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Company / Organization</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-2.5 w-4 h-4 text-[#666666]" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#161616] rounded-xl border border-[#2A2A2A] text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Short Bio</label>
            <input
              type="text"
              placeholder="e.g. Luxury event producer, keynote speaker..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-[#161616] rounded-xl border border-[#2A2A2A] text-white text-xs focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          {/* Notification Preferences */}
          <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Bell className="w-4 h-4 text-[#D4AF37]" />
              <span>Notification Preferences</span>
            </div>

            <label className="flex items-center justify-between text-xs text-[#CCCCCC] cursor-pointer">
              <span>Receive WhatsApp updates for invitations & RSVPs</span>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="rounded border-[#333333] bg-[#181818] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-[#CCCCCC] cursor-pointer">
              <span>Receive Event confirmation emails & PDF invoices</span>
              <input
                type="checkbox"
                checked={emailUpdates}
                onChange={(e) => setEmailUpdates(e.target.checked)}
                className="rounded border-[#333333] bg-[#181818] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
              />
            </label>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#181818] hover:bg-[#222222] text-[#CCCCCC] border border-[#2E2E2E] text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] text-black text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
