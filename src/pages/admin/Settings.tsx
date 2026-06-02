import React, { useState } from 'react';
import { Save, Lock, User, Bell, Shield, Database } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';

interface NotificationSettings {
  emailNotifications: boolean;
  storySubmissions: boolean;
  systemUpdates: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
}

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile Settings State
  const [profileData, setProfileData] = useState({
    displayName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    role: user?.user_metadata?.role || 'admin'
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    storySubmissions: true,
    systemUpdates: false
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30
  });

  // Database Settings State
  const [databaseSettings, setDatabaseSettings] = useState({
    backupFrequency: 'daily',
    retentionPeriod: 30,
    autoCleanup: true
  });

  const handlePasswordSubmit = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      addToast('جميع الحقول مطلوبة', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('كلمات المرور غير متطابقة', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      addToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.currentPassword
      });

      if (signInError) {
        addToast('كلمة المرور الحالية غير صحيحة', 'error');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) throw updateError;

      addToast('تم تحديث كلمة المرور بنجاح', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      addToast('حدث خطأ أثناء تحديث كلمة المرور', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: profileData.email,
        data: {
          full_name: profileData.displayName,
          role: profileData.role
        }
      });

      if (error) throw error;
      addToast('تم تحديث الملف الشخصي بنجاح', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('حدث خطأ أثناء تحديث الملف الشخصي', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSubmit = () => {
    // This would typically connect to a backend API
    addToast('تم حفظ إعدادات الإشعارات', 'success');
  };

  const handleSecuritySubmit = () => {
    // This would typically connect to a backend API
    addToast('تم حفظ إعدادات الأمان', 'success');
  };

  const handleDatabaseSubmit = () => {
    // This would typically connect to a backend API
    addToast('تم حفظ إعدادات قاعدة البيانات', 'success');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">الإعدادات</h1>
          <p className="text-gray-400">إدارة إعدادات الحساب والنظام</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Profile Settings */}
        <div>
          <div className="flex items-center gap-2 text-xl font-bold text-white mb-4">
            <User className="w-6 h-6" />
            <h2>الملف الشخصي</h2>
          </div>
          <Card>
            <div className="space-y-6">
              <Input
                label="الاسم الكامل"
                value={profileData.displayName}
                onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                placeholder="أدخل اسمك الكامل"
              />
              <Input
                label="البريد الإلكتروني"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="أدخل بريدك الإلكتروني"
              />
              <Select
                label="الدور"
                value={profileData.role}
                onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                options={[
                  { value: 'admin', label: 'مدير النظام' },
                  { value: 'editor', label: 'محرر' },
                  { value: 'viewer', label: 'مشاهد' }
                ]}
              />
              <Button onClick={handleProfileSubmit} isLoading={isLoading}>
                حفظ التغييرات
              </Button>
            </div>
          </Card>
        </div>

        {/* Security Settings */}
        <div>
          <div className="flex items-center gap-2 text-xl font-bold text-white mb-4">
            <Lock className="w-6 h-6" />
            <h2>الأمان</h2>
          </div>
          <Card>
            <div className="space-y-6">
              <Input
                label="كلمة المرور الحالية"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="أدخل كلمة المرور الحالية"
              />
              <Input
                label="كلمة المرور الجديدة"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="أدخل كلمة المرور الجديدة"
              />
              <Input
                label="تأكيد كلمة المرور"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="أعد إدخال كلمة المرور الجديدة"
              />
              <div className="flex items-center justify-between py-4 border-t border-white/10">
                <div>
                  <h3 className="text-white font-medium mb-1">المصادقة الثنائية</h3>
                  <p className="text-sm text-gray-400">تفعيل المصادقة الثنائية لتعزيز أمان حسابك</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                    className="sr-only"
                    id="twoFactorAuth"
                  />
                  <label
                    htmlFor="twoFactorAuth"
                    className={`block w-14 h-8 rounded-full transition-colors duration-300 cursor-pointer ${
                      securitySettings.twoFactorAuth ? 'bg-[#FAC39B]' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`block w-6 h-6 mt-1 ml-1 rounded-full transition-transform duration-300 bg-white ${
                        securitySettings.twoFactorAuth ? 'translate-x-6' : ''
                      }`}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  مهلة الجلسة (بالدقائق)
                </label>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="15"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-sm text-gray-400 mt-2">
                  {securitySettings.sessionTimeout} دقيقة
                </div>
              </div>
              <Button onClick={handleSecuritySubmit}>
                حفظ إعدادات الأمان
              </Button>
            </div>
          </Card>
        </div>

        {/* Notification Settings */}
        <div>
          <div className="flex items-center gap-2 text-xl font-bold text-white mb-4">
            <Bell className="w-6 h-6" />
            <h2>الإشعارات</h2>
          </div>
          <Card>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4">
                <div>
                  <h3 className="text-white font-medium mb-1">إشعارات البريد الإلكتروني</h3>
                  <p className="text-sm text-gray-400">استلام الإشعارات عبر البريد الإلكتروني</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                    className="sr-only"
                    id="emailNotifications"
                  />
                  <label
                    htmlFor="emailNotifications"
                    className={`block w-14 h-8 rounded-full transition-colors duration-300 cursor-pointer ${
                      notificationSettings.emailNotifications ? 'bg-[#FAC39B]' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`block w-6 h-6 mt-1 ml-1 rounded-full transition-transform duration-300 bg-white ${
                        notificationSettings.emailNotifications ? 'translate-x-6' : ''
                      }`}
                    />
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-between py-4 border-t border-white/10">
                <div>
                  <h3 className="text-white font-medium mb-1">إشعارات القصص الجديدة</h3>
                  <p className="text-sm text-gray-400">استلام إشعار عند إرسال قصة جديدة</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={notificationSettings.storySubmissions}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, storySubmissions: e.target.checked })}
                    className="sr-only"
                    id="storySubmissions"
                  />
                  <label
                    htmlFor="storySubmissions"
                    className={`block w-14 h-8 rounded-full transition-colors duration-300 cursor-pointer ${
                      notificationSettings.storySubmissions ? 'bg-[#FAC39B]' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`block w-6 h-6 mt-1 ml-1 rounded-full transition-transform duration-300 bg-white ${
                        notificationSettings.storySubmissions ? 'translate-x-6' : ''
                      }`}
                    />
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-between py-4 border-t border-white/10">
                <div>
                  <h3 className="text-white font-medium mb-1">تحديثات النظام</h3>
                  <p className="text-sm text-gray-400">استلام إشعارات عن تحديثات وتغييرات النظام</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={notificationSettings.systemUpdates}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, systemUpdates: e.target.checked })}
                    className="sr-only"
                    id="systemUpdates"
                  />
                  <label
                    htmlFor="systemUpdates"
                    className={`block w-14 h-8 rounded-full transition-colors duration-300 cursor-pointer ${
                      notificationSettings.systemUpdates ? 'bg-[#FAC39B]' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`block w-6 h-6 mt-1 ml-1 rounded-full transition-transform duration-300 bg-white ${
                        notificationSettings.systemUpdates ? 'translate-x-6' : ''
                      }`}
                    />
                  </label>
                </div>
              </div>
              <Button onClick={handleNotificationSubmit}>
                حفظ إعدادات الإشعارات
              </Button>
            </div>
          </Card>
        </div>

        {/* Database Settings */}
        <div>
          <div className="flex items-center gap-2 text-xl font-bold text-white mb-4">
            <Database className="w-6 h-6" />
            <h2>قاعدة البيانات</h2>
          </div>
          <Card>
            <div className="space-y-6">
              <Select
                label="تكرار النسخ الاحتياطي"
                value={databaseSettings.backupFrequency}
                onChange={(e) => setDatabaseSettings({ ...databaseSettings, backupFrequency: e.target.value })}
                options={[
                  { value: 'hourly', label: 'كل ساعة' },
                  { value: 'daily', label: 'يومياً' },
                  { value: 'weekly', label: 'أسبوعياً' },
                  { value: 'monthly', label: 'شهرياً' }
                ]}
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  فترة الاحتفاظ بالنسخ الاحتياطية (بالأيام)
                </label>
                <input
                  type="range"
                  min="7"
                  max="90"
                  step="7"
                  value={databaseSettings.retentionPeriod}
                  onChange={(e) => setDatabaseSettings({ ...databaseSettings, retentionPeriod: parseInt(e.target.value) })}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-sm text-gray-400 mt-2">
                  {databaseSettings.retentionPeriod} يوم
                </div>
              </div>
              <div className="flex items-center justify-between py-4 border-t border-white/10">
                <div>
                  <h3 className="text-white font-medium mb-1">التنظيف التلقائي</h3>
                  <p className="text-sm text-gray-400">حذف النسخ الاحتياطية القديمة تلقائياً</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={databaseSettings.autoCleanup}
                    onChange={(e) => setDatabaseSettings({ ...databaseSettings, autoCleanup: e.target.checked })}
                    className="sr-only"
                    id="autoCleanup"
                  />
                  <label
                    htmlFor="autoCleanup"
                    className={`block w-14 h-8 rounded-full transition-colors duration-300 cursor-pointer ${
                      databaseSettings.autoCleanup ? 'bg-[#FAC39B]' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`block w-6 h-6 mt-1 ml-1 rounded-full transition-transform duration-300 bg-white ${
                        databaseSettings.autoCleanup ? 'translate-x-6' : ''
                      }`}
                    />
                  </label>
                </div>
              </div>
              <Button onClick={handleDatabaseSubmit}>
                حفظ إعدادات قاعدة البيانات
              </Button>
            </div>
          </Card>
        </div>

        {/* Account Info */}
        <Card>
          <h3 className="text-lg font-medium text-white mb-4">معلومات الحساب</h3>
          <div className="space-y-2">
            <p className="text-gray-400">
              البريد الإلكتروني: <span className="text-white">{user?.email}</span>
            </p>
            <p className="text-gray-400">
              آخر تسجيل دخول: <span className="text-white">{new Date(user?.last_sign_in_at || '').toLocaleString('ar-SA')}</span>
            </p>
            <p className="text-gray-400">
              تاريخ إنشاء الحساب: <span className="text-white">{new Date(user?.created_at || '').toLocaleString('ar-SA')}</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}