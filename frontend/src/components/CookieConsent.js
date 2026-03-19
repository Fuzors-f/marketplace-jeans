import React, { useState, useEffect } from 'react';
import { useSettings } from '../utils/SettingsContext';
import { useLanguage } from '../utils/i18n';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showEula, setShowEula] = useState(false);
  const { getSetting } = useSettings();
  const { language } = useLanguage();

  const cookieText = language === 'en'
    ? getSetting('cookie_notice_en', '')
    : getSetting('cookie_notice_id', '');
  
  const eulaTitle = language === 'en'
    ? getSetting('eula_title_en', 'Terms & Conditions')
    : getSetting('eula_title_id', 'Syarat & Ketentuan');

  const eulaContent = language === 'en'
    ? getSetting('eula_content_en', '')
    : getSetting('eula_content_id', '');

  const defaultCookieText = language === 'en'
    ? 'We use cookies to improve your experience on our site. By continuing to browse, you agree to our use of cookies.'
    : 'Kami menggunakan cookie untuk meningkatkan pengalaman Anda di situs kami. Dengan melanjutkan menjelajah, Anda menyetujui penggunaan cookie kami.';

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Delay showing to avoid blocking initial render
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
    setShowEula(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
    setShowEula(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Cookie Banner */}
      {!showEula && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-gray-900 text-white shadow-2xl border-t border-gray-700"
          style={{ animation: 'slideUp 0.3s ease-out' }}>
            <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
            <div className="container mx-auto px-4 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="font-semibold text-sm">
                      {language === 'en' ? 'Cookie & Privacy Notice' : 'Pemberitahuan Cookie & Privasi'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {cookieText || defaultCookieText}
                    {eulaContent && (
                      <>
                        {' '}
                        <button
                          onClick={() => setShowEula(true)}
                          className="text-blue-400 hover:text-blue-300 underline font-medium"
                        >
                          {language === 'en' ? 'Read Terms & Conditions' : 'Baca Syarat & Ketentuan'}
                        </button>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                  <button
                    onClick={handleDecline}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm border border-gray-500 text-gray-300 rounded hover:bg-gray-800 transition"
                  >
                    {language === 'en' ? 'Decline' : 'Tolak'}
                  </button>
                  <button
                    onClick={handleAccept}
                    className="flex-1 sm:flex-none px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
                  >
                    {language === 'en' ? 'Accept All' : 'Terima Semua'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EULA Modal */}
      {showEula && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEula(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">{eulaTitle}</h2>
              <button
                onClick={() => setShowEula(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div 
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: eulaContent || (language === 'en' ? '<p>No terms & conditions content has been set.</p>' : '<p>Konten syarat & ketentuan belum diatur.</p>') }}
              />
            </div>
            
            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={handleDecline}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
              >
                {language === 'en' ? 'Decline' : 'Tolak'}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                {language === 'en' ? 'I Agree' : 'Saya Setuju'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
