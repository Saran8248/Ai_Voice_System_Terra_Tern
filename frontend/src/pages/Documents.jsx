import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { apiFetch } from '../services/api';
import { Upload, Trash2, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocs = async () => {
    try {
      const list = await apiFetch('/documents/');
      setDocuments(list);
    } catch (e) {
      console.error('Failed to load documents list', e);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiFetch('/documents/upload-document', {
        method: 'POST',
        body: formData
      });
      fetchDocs();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await apiFetch(`/documents/${id}`, { method: 'DELETE' });
      fetchDocs();
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} style={{ color: 'var(--success)' }} />;
      case 'processing':
        return <Clock size={16} style={{ color: 'var(--warning)' }} />;
      case 'failed':
        return <AlertTriangle size={16} style={{ color: 'var(--error)' }} />;
      default:
        return <Clock size={16} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Navbar title="Knowledge Base (RAG System PDFs & Text)" />

      <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        {/* Upload Panel */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Upload Company Documents</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Upload PDFs containing pricing lists, service details, and company FAQs. The agent will read, segment, and embed them automatically for instant retrieval.
          </p>

          <label style={{
            border: '2px dashed var(--border-color)',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <Upload size={32} style={{ color: 'var(--accent-color)' }} />
            <span style={{ fontSize: '13px' }}>{isUploading ? 'Uploading & chunking...' : 'Click to select PDF or TXT file'}</span>
            <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} disabled={isUploading} style={{ display: 'none' }} />
          </label>
        </div>

        {/* List of Documents */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Knowledge Base Library</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {documents.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '40px' }}>
                No documents uploaded. Add some PDF files to teach the AI Agent!
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileText size={20} style={{ color: 'var(--accent-color)' }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{doc.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Uploaded {new Date(doc.uploaded_at).toLocaleDateString()} • Status: 
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          {getStatusIcon(doc.status)} {doc.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--error)',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      transition: 'var(--transition-smooth)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
