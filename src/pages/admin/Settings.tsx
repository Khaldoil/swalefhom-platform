import React, { useState } from 'react';
import { Lock, User, Bell, Database } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import { useToast } from '../../hooks/useToast';
import { LIMITS } from '../../lib/constants';

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
  const { user, updatePassword } = useAuth();
  const { addToast } = useToast();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileData, setProfileData] = useState({
    displayName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    storySubmissions: true,
    systemUpdates: false,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: LIMITS.SESSION_TIMEOUT_MINUTES,
  });

  const [databaseSettings, setDatabaseSettings] = useState({
    backupFrequency: 'daily',
    retentionPeriod: 30,
    autoCleanup: true,
  });

  // تغيير كلمة المرور — مربوط الآن بزر الحفظ
  const handlePasswordSubmit = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      addToast('جميع الحقول مطلوبة', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('كلمات المرور غير متطابقة', 'error');
      return;
    }
    if (passwordData.newPassword.length < LIMITS.MIN_PASSWORD_LENGTH) {
      addToast(`كلمة المرور يجب أن تكون ${LIMITS.MIN_PASSWORD_LENGTH} أحرف على الأقل`, 'error');
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      addToast('تم تحديث كلمة المرور بنجاح', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث كلمة المرور';
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async () => {
    setIsLoading(true);
    try {
      const { supabase } = await import('../../lib/supabase');
      const { error } = await supabase.auth.updateUser({
        email: profileData.email,
        data: { full_name: profileData.displayName },
      });
      if (error) throw error;
      addToast('تم تحديث الملف الشخصي بنجاح', 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث الملف الشخصي';
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const Toggle = ({
    id, checked, onChange, label, description,
  }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) => (
    <div className="flex items-center justify-between py-4">
      <div>
        <h3 className="text-white font-medium mb-1">{label}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" id={id} />
        <label
          htmlFor={id}
          className={`block w-14 h-8 rounded-full transition-colors duration-300 cursor-pointer ${checked ? 'bg-[#FAC39B]' : 'bg-white/10'}`}
        >
          <span className={`block w-6 h-6 mt-1 ml-1 rounded-full transition-transform duration-300 bg-white ${checked ? 'translate-x-6' : ''}`} />
        </label>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">الإعدادات</h1>
        <p className="text-gray-400">إدارة إعدادات الحساب والنظام</p>
      </div>

      <div className="space-y-8">
        {/* الملف الشخصي */}
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
              <Button onClick={handleProfileSubmit} isLoading={isLoading}>
                حفظ الملف الشخصي
              </Button>
            </div>
          </Card>
        </div>

        {/* الأمان وكلمة المرور */}
        <div>
          <div className="flex items-center gap-2 text-xl font-bold text-white mb-4">
            <Lock className="w-6 h-6" />
            <h2>الأمان</h2>
          </div>
          <Card>
            <div className="space-y-6">
              <h3 className="text-white font-medium border-b border-white/10 pb-3">تغيير كلمة المرور</h3>
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
                placeholder={`${LIMITS.MIN_PASSWORD_LENGTH} أحرف على الأقل`}
              />
              <Input
                label="تأكيد كلمة المرور الجديدة"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="أعد إدخال كلمة المرور الجديدة"
              />
              {/* الزر مربوط الآن بـ handlePasswordSubmit */}
              <Button onClick={handlePasswordSubmit} isLoading={isLoading}>
                تحديث كلمة المرور
              </Button>

              <div className="border-t border-white/10 pt-4 space-y-4">
                <Toggle
                  id="twoFactorAuth"
                  checked={securitySettings.twoFactorAuth}
                  onChange={(v) => setSecuritySettings({ ...securitySettings, twoFactorAuth: v })}
                  label="المصادقة الثنائية"
                  description="تفعيل المصادقة الثنائية لتعزيز أمان حسابك"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    مهلة الجلسة: <span className="text-[#FAC39B]">{securitySettings.sessionTimeout} دقيقة</span>
                  </label>
                  <input
                    type="range" min="15" max="120" step="15"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* الإشعارات */}
        <div>
          <div className="flex items-center gap-2 text-xl font-bold text-white mb-4">
            <Bell className="w-6 h-6" />
            <h2>الإشعارات</h2>
          </div>
          <Card>
            <div className="divide-y divide-white/10">
              <Toggle
                id="emailNotifications"
                checked={notificationSettings.emailNotifications}
                onChange={(v) => setNotificationSettings({ ...notificationSettings, emailNotifications: v })}
                label="إشعارات البريد الإلكتروني"
                description="استلام الإشعارات عبر البريد الإلكتروني"
              />
              <Toggle
                id="storySubmissions"
                checked={notificationSettings.storySubmissions}
                onChange={(v) => setNotificationSettings({ ...notificationSettings, storySubmissions: v })}
                label="إشعارات القصص الجديدة"
                description="استلام إشعار عند إرسال قصة جديدة"
              />
              <Toggle
                id="systemUpdates"
                checked={notificationSettings.systemUpdates}
                onChange={(v) => setNotificationSettings({ ...notificationSettings, systemUpdates: v })}
                label="تحديثات النظام"
                description="استلام إشعارات عن تحديثات وتغييرات النظام"
              />
            </div>
          </Card>
        </div>

        {/* قاعدة البيانات */}
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
                  { value: 'monthly', label: 'شهرياً' },
                ]}
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  فترة الاحتفاظ بالنسخ الاحتياطية: <span className="text-[#FAC39B]">{databaseSettings.retentionPeriod} يوم</span>
                </label>
                <input
                  type="range" min="7" max="90" step="7"
                  value={databaseSettings.retentionPeriod}
                  onChange={(e) => setDatabaseSettings({ ...databaseSettings, retentionPeriod: parseInt(e.target.value) })}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <Toggle
                id="autoCleanup"
                checked={databaseSettings.autoCleanup}
                onChange={(v) => setDatabaseSettings({ ...databaseSettings, autoCleanup: v })}
                label="التنظيف التلقائي"
                description="حذف النسخ الاحتياطية القديمة تلقائياً"
              />
            </div>
          </Card>
        </div>

        {/* معلومات الحساب */}
        <Card>
          <h3 className="text-lg font-medium text-white mb-4">معلومات الحساب</h3>
          <div className="space-y-2">
            <p className="text-gray-400">البريد الإلكتروني: <span className="text-white">{user?.email}</span></p>
            <p className="text-gray-400">آخر تسجيل دخول: <span className="text-white">{new Date(user?.last_sign_in_at || '').toLocaleString('ar-SA')}</span></p>
            <p className="text-gray-400">تاريخ إنشاء الحساب: <span className="text-white">{new Date(user?.created_at || '').toLocaleString('ar-SA')}</span></p>
          </div>
        </Card>
      </div>
    </div>
  );
}
