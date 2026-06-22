import React, { useState } from 'react';
import { api } from '../utils/api';
import { toast } from 'react-hot-toast';
import { Download, Mail, FileJson, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  tripId: string;
  destination: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ tripId, destination }) => {
  const [isExporting, setIsExporting] = useState<'pdf' | 'email' | 'json' | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');

  const handleExportPDF = async () => {
    setIsExporting('pdf');
    try {
      const response = await api.get(`/api/export/${tripId}/pdf`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TravelWave-${destination}-Itinerary.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting('json');
    try {
      const response = await api.get(`/api/export/${tripId}/json`);
      const data = response.data;
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TravelWave-${destination}-Itinerary.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('JSON downloaded successfully');
    } catch (error) {
      toast.error('Failed to export JSON');
    } finally {
      setIsExporting(null);
    }
  };

  const handleEmailPDF = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsExporting('email');
    try {
      await api.post(`/api/export/${tripId}/email`, { email });
      toast.success(`PDF sent to ${email}`);
      setShowEmailModal(false);
      setEmail('');
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleExportPDF}
          disabled={isExporting === 'pdf'}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
        >
          {isExporting === 'pdf' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          PDF
        </button>
        
        <button
          onClick={() => setShowEmailModal(true)}
          disabled={isExporting === 'email'}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
        >
          {isExporting === 'email' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          Email
        </button>
        
        <button
          onClick={handleExportJSON}
          disabled={isExporting === 'json'}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
        >
          {isExporting === 'json' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileJson className="w-4 h-4" />
          )}
          JSON
        </button>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-slate-200 mb-2">Send PDF via Email</h3>
            <p className="text-sm text-slate-400 mb-4">
              Enter the email address where you'd like to receive the PDF.
            </p>
            
            <form onSubmit={handleEmailPDF}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isExporting === 'email'}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50"
                >
                  {isExporting === 'email' ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Send'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmail('');
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};