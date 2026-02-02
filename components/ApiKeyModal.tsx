import React, { useState, useEffect } from 'react';
import { Key, Lock, AlertCircle, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = inputKey.trim();
    if (trimmedKey.length < 30) {
      setError('API Key có vẻ không hợp lệ (quá ngắn).');
      return;
    }
    onSave(trimmedKey);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-history-red p-6 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Cấu hình API Key</h2>
          <p className="text-red-100 text-sm mt-2">
            Ứng dụng cần Google Gemini API Key để hoạt động.
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 flex items-start gap-3">
            <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Bảo mật Client-side</p>
              Key của bạn được lưu cục bộ trong trình duyệt (LocalStorage) và không bao giờ được gửi đi đâu ngoại trừ Google API.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                Dán API Key của bạn vào đây
              </label>
              <input
                id="apiKey"
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-history-red focus:border-history-red outline-none transition-all"
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-2 animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-history-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              Lưu và Bắt đầu
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-history-red inline-flex items-center gap-1 transition-colors"
            >
              Chưa có Key? Lấy miễn phí tại đây <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};