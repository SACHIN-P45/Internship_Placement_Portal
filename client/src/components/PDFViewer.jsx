// PDF Viewer Modal for viewing resume
import { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const PDFViewer = ({ isOpen, resumeId, onClose, fileName }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && resumeId) {
      console.log('PDFViewer opening, resumeId:', resumeId);
      loadPDF();
    }
  }, [isOpen, resumeId]);

  const loadPDF = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Downloading resume:', resumeId);
      const response = await authService.downloadResume(resumeId);
      console.log('Download response:', response);
      // When responseType is 'blob', the data is in response.data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      console.log('PDF URL created successfully');
    } catch (error) {
      console.error('Failed to load PDF:', error);
      setError(error.message || 'Failed to load PDF');
      toast.error('Failed to load PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await authService.downloadResume(resumeId);
      // When responseType is 'blob', the data is in response.data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Resume downloaded!');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pdf-viewer-overlay" onClick={onClose}>
      <div className="pdf-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-viewer-header">
          <h3>Resume Viewer</h3>
          <div className="pdf-viewer-actions">
            <button
              className="pdf-viewer-download-btn"
              onClick={handleDownload}
              disabled={loading}
              title="Download PDF"
            >
              <FaDownload size={16} />
              Download
            </button>
            <button
              className="pdf-viewer-close-btn"
              onClick={onClose}
              title="Close"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        <div className="pdf-viewer-content">
          {loading ? (
            <div className="pdf-viewer-loading">
              <FaSpinner className="spinner" size={32} />
              <p>Loading PDF...</p>
            </div>
          ) : error ? (
            <div className="pdf-viewer-error">
              <p>Error: {error}</p>
              <p>Could not load PDF. Please try again.</p>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="Resume PDF"
              className="pdf-viewer-iframe"
            />
          ) : (
            <div className="pdf-viewer-error">
              <p>Could not load PDF</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
