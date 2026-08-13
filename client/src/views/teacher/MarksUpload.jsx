import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import '../../App.css';

export default function MarksUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [previewData, setPreviewData] = useState(null); // { valid_records, flagged_records }
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a valid CSV file.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setPreviewData(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Note: We use raw fetch here because our `api` wrapper sends JSON by default
      const token = localStorage.getItem('eduguide_token');
      const response = await fetch('http://localhost:5000/api/marks/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Upload failed');
      }

      setPreviewData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to handle inline edits of flagged records
  const handleFlaggedEdit = (index, field, value) => {
    const updatedFlagged = [...previewData.flagged_records];
    updatedFlagged[index][field] = value;
    setPreviewData({ ...previewData, flagged_records: updatedFlagged });
  };

  // Re-run basic validation on the frontend before confirming, or simply send as-is and let backend fail it
  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    // Combine valid and flagged records
    // In a real scenario, you'd re-validate the flagged ones. For this sprint, we assume the teacher fixed them correctly.
    const allRecords = [
      ...previewData.valid_records,
      ...previewData.flagged_records
    ];

    try {
      const response = await api.post('/marks/confirm', { records: allRecords });
      if (response.success) {
        setSuccess(true);
        setPreviewData(null);
        setFile(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <Link to="/teacher" style={{ color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginRight: '1rem' }}>
          <ArrowLeft size={20} /> Back
        </Link>
        <FileSpreadsheet size={36} className="icon-logo" />
        <h1>Upload Marks CSV</h1>
      </header>

      <main className="bento-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Upload Zone */}
        {!previewData && !success && (
          <div className="bento-card" style={{ padding: '3rem', textAlign: 'center', border: '2px dashed var(--sky-200)' }}>
            <UploadCloud size={64} color="var(--sky-400)" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--sky-900)' }}>Drag & Drop your CSV here</h2>
            <p style={{ color: 'var(--slate-500)', marginBottom: '2rem' }}>
              Expected columns: Roll Number, Subject, Marks Obtained, Maximum Marks, Exam Name
            </p>
            
            <input 
              type="file" 
              accept=".csv" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <button 
              className="btn-primary" 
              style={{ margin: '0 auto', minWidth: '200px' }}
              onClick={() => fileInputRef.current.click()}
            >
              Select File
            </button>
            
            {file && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--sky-50)', borderRadius: 'var(--radius-md)', display: 'inline-block' }}>
                <strong>Selected:</strong> {file.name}
              </div>
            )}

            {file && (
              <div style={{ marginTop: '1.5rem' }}>
                <button className="btn-primary" style={{ margin: '0 auto', background: 'var(--sky-600)' }} onClick={handleUpload} disabled={loading}>
                  {loading ? 'Analyzing...' : 'Analyze CSV'}
                </button>
              </div>
            )}

            {error && (
              <div className="error-message" style={{ marginTop: '2rem', justifyContent: 'center' }}>
                <AlertCircle size={18} /> {error}
              </div>
            )}
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="bento-card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--success-bg)', borderColor: 'var(--success-border)' }}>
            <CheckCircle2 size={64} color="var(--success-text)" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ color: 'var(--success-text)', marginBottom: '1rem' }}>Upload Successful!</h2>
            <p style={{ color: 'var(--slate-700)', marginBottom: '2rem' }}>The marks have been saved to the database.</p>
            <button className="btn-primary" onClick={() => setSuccess(false)} style={{ margin: '0 auto', background: 'var(--success-text)' }}>
              Upload Another File
            </button>
          </div>
        )}

        {/* Preview Zone */}
        {previewData && (
          <>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="bento-card" style={{ flex: 1, background: 'var(--success-bg)', borderColor: 'var(--success-border)' }}>
                <h3 style={{ color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={20} /> Valid Records ({previewData.valid_count})
                </h3>
              </div>
              <div className="bento-card" style={{ flex: 1, background: previewData.flagged_count > 0 ? 'var(--error-bg)' : 'white', borderColor: previewData.flagged_count > 0 ? 'var(--error-border)' : 'var(--sky-100)' }}>
                <h3 style={{ color: previewData.flagged_count > 0 ? 'var(--error-text)' : 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={20} /> Flagged Anomalies ({previewData.flagged_count})
                </h3>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {previewData.flagged_count > 0 && (
              <div className="bento-card">
                <h2 style={{ marginBottom: '1rem', color: 'var(--error-text)' }}>Review Anomalies</h2>
                <p style={{ marginBottom: '1.5rem', color: 'var(--slate-600)' }}>Please correct the highlighted values below before submitting.</p>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--slate-200)', color: 'var(--slate-500)' }}>
                        <th style={{ padding: '0.75rem' }}>Row</th>
                        <th style={{ padding: '0.75rem' }}>Roll No</th>
                        <th style={{ padding: '0.75rem' }}>Subject</th>
                        <th style={{ padding: '0.75rem' }}>Marks</th>
                        <th style={{ padding: '0.75rem' }}>Max</th>
                        <th style={{ padding: '0.75rem' }}>Error Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.flagged_records.map((record, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--slate-100)', background: 'var(--error-bg)' }}>
                          <td style={{ padding: '0.75rem' }}>{record.row}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <input 
                              type="text" 
                              value={record.roll_no} 
                              onChange={(e) => handleFlaggedEdit(idx, 'roll_no', e.target.value)}
                              style={{ width: '80px', padding: '0.25rem' }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem' }}>{record.subject}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <input 
                              type="number" 
                              value={record.marks_obtained} 
                              onChange={(e) => handleFlaggedEdit(idx, 'marks_obtained', e.target.value)}
                              style={{ width: '60px', padding: '0.25rem', borderColor: record.errors.some(e => e.includes('Marks')) ? 'red' : '#ccc' }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <input 
                              type="number" 
                              value={record.max_marks} 
                              onChange={(e) => handleFlaggedEdit(idx, 'max_marks', e.target.value)}
                              style={{ width: '60px', padding: '0.25rem' }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem', color: 'var(--error-text)', fontSize: '0.85rem' }}>
                            {record.errors.join(' | ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-primary" style={{ background: 'var(--slate-400)' }} onClick={() => setPreviewData(null)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleConfirm} disabled={loading}>
                <Save size={18} /> {loading ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
