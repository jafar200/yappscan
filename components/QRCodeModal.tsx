import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Icons } from './Icons';

interface QRCodeModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ url, title, onClose }) => {
  const [isQrVisible, setIsQrVisible] = useState(false);
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Delay rendering of the QR code to allow the modal animation to be smooth.
    const timer = setTimeout(() => {
      setIsQrVisible(true);
    }, 150); 

    return () => clearTimeout(timer);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      alert('فشل نسخ الرابط.');
    });
  };

  const printQRCode = () => {
    const qrCodeElement = document.getElementById('qrcode-canvas');
    if (qrCodeElement) {
        const canvas = qrCodeElement.getElementsByTagName('canvas')[0];
        if (!canvas) {
            console.error('QR Code canvas not found for printing.');
            return;
        }
        const dataUrl = canvas.toDataURL('image/png');
        let windowContent = '<!DOCTYPE html>';
        windowContent += '<html>';
        windowContent += '<head><title>Print QR Code</title></head>';
        windowContent += '<body style="text-align: center; font-family: sans-serif;">';
        windowContent += `<h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${title}</h2>`;
        windowContent += `<p style="color: #666; margin-top: 0;">امسح الرمز ضوئيًا للوصول إلى القائمة مباشرة</p>`;
        windowContent += `<img src="${dataUrl}" style="width: 300px; height: 300px; display: block; margin: 20px auto 10px;">`;
        windowContent += `<p style="font-size: 1.2rem; font-weight: 600;">${title}</p>`;
        windowContent += '</body></html>';
        const printWin = window.open('', '', 'width=400,height=500');
        printWin?.document.open();
        printWin?.document.write(windowContent);
        printWin?.document.close();
        printWin?.focus();
        printWin?.print();
        printWin?.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 m-4 max-w-sm w-full transform transition-all duration-300 scale-95 hover:scale-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">{title}</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">شارك القائمة عبر الرمز أو بنسخ الرابط</p>
        <div id="qrcode-canvas" className="p-4 bg-white rounded-lg flex flex-col justify-center items-center mb-4">
          <div style={{ width: 256, height: 256, backgroundColor: qrBgColor }} className="flex justify-center items-center">
             {isQrVisible ? (
              <QRCodeCanvas 
                value={url} 
                size={256} 
                level="H" 
                fgColor={qrColor}
                bgColor={qrBgColor}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
            )}
          </div>
          <p className="mt-4 text-center font-semibold text-gray-700">{title}</p>
        </div>

        <div className="mb-6">
            <button
              onClick={handleCopyLink}
              className={`w-full flex items-center justify-center text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 ${isCopied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isCopied ? (
                <>
                  <Icons.Check className="w-5 h-5 ml-2" />
                  <span>تم نسخ الرابط!</span>
                </>
              ) : (
                <>
                  <Icons.Link className="w-5 h-5 ml-2" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
        </div>
        
        <div className="mb-6">
            <h3 className="text-md font-semibold text-center text-gray-700 dark:text-gray-300 mb-3">تخصيص الألوان</h3>
            <div className="flex justify-around items-center">
                <div className="flex flex-col items-center">
                    <label htmlFor="qrColor" className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">لون الرمز</label>
                    <input
                        id="qrColor"
                        type="color"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="w-16 h-10 p-1 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                    />
                </div>
                <div className="flex flex-col items-center">
                    <label htmlFor="qrBgColor" className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">لون الخلفية</label>
                    <input
                        id="qrBgColor"
                        type="color"
                        value={qrBgColor}
                        onChange={(e) => setQrBgColor(e.target.value)}
                        className="w-16 h-10 p-1 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                    />
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-4">
            <button
              onClick={printQRCode}
              disabled={!isQrVisible}
              className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              طباعة الرمز
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-transform transform hover:scale-105"
            >
              إغلاق
            </button>
        </div>
      </div>
    </div>
  );
};