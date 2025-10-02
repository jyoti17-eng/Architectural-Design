import React, { useState, useEffect } from 'react';
import SimpleDrawingCanvas from './SimpleDrawingCanvas';
import axios from 'axios';
import toast from 'react-hot-toast';

const SketchEditor = ({ designId, onSave, onClose }) => {
  const [sketchData, setSketchData] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sketch');

  useEffect(() => {
    if (designId) {
      fetchDesignData();
    }
  }, [designId]);

  const fetchDesignData = async () => {
    try {
      const response = await axios.get(`/api/designs/${designId}`);
      const design = response.data.design;
      
      if (design.sketchData) {
        setSketchData(design.sketchData);
        setAnnotations(design.sketchData.annotations || []);
      }
    } catch (error) {
      console.error('Failed to fetch design data:', error);
      toast.error('Failed to load sketch data');
    }
  };

  const handleSketchSave = async (canvasData) => {
    setLoading(true);
    try {
      const updatedSketchData = {
        ...sketchData,
        canvas: canvasData,
        annotations: annotations,
        lastModified: new Date().toISOString()
      };

      await axios.put(`/api/designs/${designId}`, {
        sketchData: updatedSketchData
      });

      setSketchData(updatedSketchData);
      toast.success('Sketch saved successfully!');
      
      if (onSave) {
        onSave(updatedSketchData);
      }
    } catch (error) {
      console.error('Failed to save sketch:', error);
      toast.error('Failed to save sketch');
    } finally {
      setLoading(false);
    }
  };

  const addAnnotation = () => {
    if (newAnnotation.trim()) {
      const annotation = {
        id: Date.now(),
        content: newAnnotation.trim(),
        timestamp: new Date().toISOString(),
        position: { x: 0, y: 0 }
      };
      
      setAnnotations([...annotations, annotation]);
      setNewAnnotation('');
    }
  };

  const removeAnnotation = (id) => {
    setAnnotations(annotations.filter(ann => ann.id !== id));
  };

  const exportSketch = () => {
    // This would trigger the canvas export
    toast.success('Export functionality would be implemented here');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '90vw',
        height: '90vh',
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
            Sketch Editor
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          {[
            { id: 'sketch', label: '✏️ Sketch' },
            { id: 'annotations', label: '📝 Annotations' },
            { id: 'export', label: '💾 Export' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: activeTab === tab.id ? 'white' : 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #667eea' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? '600' : '400',
                color: activeTab === tab.id ? '#667eea' : '#64748b'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {activeTab === 'sketch' && (
            <div style={{ flex: 1, padding: '20px' }}>
              <SimpleDrawingCanvas
                onSave={handleSketchSave}
                initialData={sketchData?.canvas}
                readOnly={false}
              />
            </div>
          )}

          {activeTab === 'annotations' && (
            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '12px' }}>Add Annotation</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newAnnotation}
                    onChange={(e) => setNewAnnotation(e.target.value)}
                    placeholder="Enter annotation text..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && addAnnotation()}
                  />
                  <button
                    onClick={addAnnotation}
                    style={{
                      padding: '8px 16px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{ marginBottom: '12px' }}>Annotations ({annotations.length})</h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {annotations.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                      No annotations yet
                    </p>
                  ) : (
                    annotations.map((annotation) => (
                      <div
                        key={annotation.id}
                        style={{
                          padding: '12px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          marginBottom: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start'
                        }}
                      >
                        <div>
                          <p style={{ margin: 0, marginBottom: '4px' }}>{annotation.content}</p>
                          <small style={{ color: '#64748b' }}>
                            {new Date(annotation.timestamp).toLocaleString()}
                          </small>
                        </div>
                        <button
                          onClick={() => removeAnnotation(annotation.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div style={{ flex: 1, padding: '20px' }}>
              <h3 style={{ marginBottom: '20px' }}>Export Options</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <button
                  onClick={exportSketch}
                  style={{
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                  <div style={{ fontWeight: '500' }}>PNG Image</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>High quality image</div>
                </button>
                
                <button
                  onClick={exportSketch}
                  style={{
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                  <div style={{ fontWeight: '500' }}>PDF Document</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Printable format</div>
                </button>
                
                <button
                  onClick={exportSketch}
                  style={{
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>💾</div>
                  <div style={{ fontWeight: '500' }}>JSON Data</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Editable format</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ color: '#64748b', fontSize: '14px' }}>
            {loading ? 'Saving...' : 'Ready to sketch'}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            <button
              onClick={() => handleSketchSave(sketchData?.canvas)}
              disabled={loading}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: '#667eea',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Saving...' : 'Save Sketch'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SketchEditor;
