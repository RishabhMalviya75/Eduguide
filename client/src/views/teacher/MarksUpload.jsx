import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, ArrowLeft, Save, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function MarksUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [previewData, setPreviewData] = useState(null);
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

  const handleFlaggedEdit = (index, field, value) => {
    const updatedFlagged = [...previewData.flagged_records];
    updatedFlagged[index][field] = value;
    setPreviewData({ ...previewData, flagged_records: updatedFlagged });
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/teacher" className="btn-secondary">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
        <span className="badge badge-emerald">CSV Pipeline v2.0</span>
      </div>

      {/* Upload Zone */}
      {!previewData && !success && (
        <div className="dash-card span-12" style={{ padding: '3.5rem 2rem', textAlign: 'center', border: '2px dashed var(--brand-emerald-border)', background: 'var(--brand-emerald-light)' }}>
          <div className="auth-icon-wrapper" style={{ margin: '0 auto 1.25rem auto' }}>
            <UploadCloud size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--slate-900)', marginBottom: '0.4rem' }}>
            Drag & Drop Marks CSV File
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem auto' }}>
            Expected format: <code>roll_no, subject, marks_obtained, max_marks, exam_name</code>
          </p>
          
          <input 
            type="file" 
            accept=".csv" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button className="btn-primary" onClick={() => fileInputRef.current.click()}>
              <FileSpreadsheet size={18} /> Select CSV File
            </button>
          </div>
          
          {file && (
            <div style={{ marginTop: '1.5rem' }}>
              <span className="badge badge-emerald" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Selected: {file.name}
              </span>
              <div style={{ marginTop: '1rem' }}>
                <button className="btn-primary" onClick={handleUpload} disabled={loading}>
                  {loading ? 'Analyzing Validation Rules...' : 'Run CSV Validation'}
                </button>
              </div>
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
        <div className="dash-card span-12" style={{ padding: '3rem', textAlign: 'center', background: 'var(--brand-emerald-light)', border: '1px solid var(--brand-emerald-border)' }}>
          <CheckCircle2 size={64} color="var(--brand-emerald)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ color: 'var(--brand-emerald-dark)', marginBottom: '0.5rem' }}>Marks Successfully Ingested!</h2>
          <p style={{ color: 'var(--slate-600)', marginBottom: '2rem' }}>All student marks have been validated and saved to the database.</p>
          <button className="btn-primary" onClick={() => setSuccess(false)}>
            Upload Another Dataset
          </button>
        </div>
      )}

      {/* Preview Zone */}
      {previewData && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="dash-card" style={{ borderLeft: '4px solid var(--brand-emerald)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} color="var(--brand-emerald)" />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)' }}>Valid Records ({previewData.valid_count})</h3>
              </div>
            </div>

            <div className="dash-card" style={{ borderLeft: previewData.flagged_count > 0 ? '4px solid #DC2626' : '4px solid var(--slate-300)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} color={previewData.flagged_count > 0 ? '#DC2626' : 'var(--slate-400)'} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)' }}>Flagged Anomalies ({previewData.flagged_count})</h3>
              </div>
            </div>
          </div>

          {previewData.flagged_count > 0 && (
            <div className="dash-card">
              <h2 style={{ fontSize: '1.2rem', color: '#DC2626', marginBottom: '0.5rem' }}>Review CSV Anomalies</h2>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                Correct highlighted values below prior to final database insertion.
              </p>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--slate-200)', color: 'var(--slate-500)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.75rem' }}>Row</th>
                      <th style={{ padding: '0.75rem' }}>Roll No</th>
                      <th style={{ padding: '0.75rem' }}>Subject</th>
                      <th style={{ padding: '0.75rem' }}>Marks</th>
                      <th style={{ padding: '0.75rem' }}>Max Marks</th>
                      <th style={{ padding: '0.75rem' }}>Error Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.flagged_records.map((record, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--slate-100)', background: '#FEF2F2' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{record.row}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <input 
                            type="text" 
                            className="form-input"
                            value={record.roll_no} 
                            onChange={(e) => handleFlaggedEdit(idx, 'roll_no', e.target.value)}
                            style={{ width: '90px', padding: '0.35rem 0.5rem' }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{record.subject}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <input 
                            type="number" 
                            className="form-input"
                            value={record.marks_obtained} 
                            onChange={(e) => handleFlaggedEdit(idx, 'marks_obtained', e.target.value)}
                            style={{ width: '75px', padding: '0.35rem 0.5rem' }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <input 
                            type="number" 
                            className="form-input"
                            value={record.max_marks} 
                            onChange={(e) => handleFlaggedEdit(idx, 'max_marks', e.target.value)}
                            style={{ width: '75px', padding: '0.35rem 0.5rem' }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem', color: '#DC2626', fontSize: '0.85rem' }}>
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
            <button className="btn-secondary" onClick={() => setPreviewData(null)}>
              Cancel Preview
            </button>
            <button className="btn-primary" onClick={handleConfirm} disabled={loading}>
              <Save size={18} /> {loading ? 'Committing Marks...' : 'Confirm & Save Records'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
