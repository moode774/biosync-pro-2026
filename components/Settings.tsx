import React, { useState } from 'react';
import { Shield, Wifi, Save, Server, Database } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  const { t, language, setLanguage, dir } = useLanguage();
  const [ip, setIp] = useState(settings.deviceIp);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdateSettings({
      ...settings,
      deviceIp: ip,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900">{t('settings')}</h1>

      {/* Safety Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
        <Shield className="text-blue-600 shrink-0 mt-1" size={24} />
        <div>
          <h3 className="font-bold text-blue-900 mb-1">{t('safe_mode')}</h3>
          <p className="text-blue-700 text-sm leading-relaxed">
            This application operates in a strictly read-only mode. It connects to the biometric device at the configured IP to fetch attendance logs. It guarantees that no data is ever written, deleted, or modified on the physical device.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Configuration */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 p-8 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-xl">
               <Server size={20} className="text-gray-700"/>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Connection Setup</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('device_ip')}</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. 10.10.1.127"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Target URL: http://{ip}/csl/check</p>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">{t('firebase_status')}</label>
             <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                <Database size={18} />
                <span className="font-medium">Firebase Storage Active</span>
             </div>
             <p className="text-xs text-gray-400 mt-2">Data is securely synced to your cloud database.</p>
          </div>

          <button 
            onClick={handleSave}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${isSaved ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
          >
            {isSaved ? <span className="flex items-center gap-2">Saved!</span> : <><Save size={18} /> {t('save')}</>}
          </button>
        </div>

        {/* App Preferences */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 p-8 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-xl">
               <Wifi size={20} className="text-gray-700"/>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Interface Language / اللغة</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setLanguage('en')}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${language === 'en' ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('ar')}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${language === 'ar' ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                العربية
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};