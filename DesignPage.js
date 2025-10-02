import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import SketchEditor from '../components/SketchEditor';
import Simple3DViewer from '../components/Simple3DViewer';
import AIAssistant from '../components/AIAssistant';
import EnhancedComments from '../components/EnhancedComments';

const DesignPage = () => {
  const { designId } = useParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSketchEditor, setShowSketchEditor] = useState(false);
  const [show3DViewer, setShow3DViewer] = useState(false);

  useEffect(() => {
    fetchDesignData();
  }, [designId]);

  const fetchDesignData = async () => {
    try {
      const response = await axios.get(`/api/designs/${designId}`);
      setDesign(response.data.design);
    } catch (error) {
      console.error('Failed to fetch design data:', error);
      toast.error('Failed to load design data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sketch': return '✏️';
      case '2d': return '📐';
      case '3d': return '🏗️';
      case 'rendering': return '🎨';
      case 'blueprint': return '📋';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (!design) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Design not found</h2>
        <button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate(`/project/${design.project._id}`)}
            style={{
              background: 'none',
              border: '1px solid #e2e8f0',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ← Back to Project
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>{getTypeIcon(design.type)}</span>
            <h1 className="dashboard-title">{design.name}</h1>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: '#64748b', marginBottom: '16px' }}>{design.description}</p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748b' }}>
            <span>Type: {design.type}</span>
            <span>Status: {design.status}</span>
            <span>Version: {design.version}</span>
            <span>Created: {new Date(design.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setShowSketchEditor(true)}
            style={{
              padding: '12px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ✏️ Edit Sketch
          </button>
          
          <button
            onClick={() => setShow3DViewer(true)}
            style={{
              padding: '12px 20px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🏗️ 3D View
          </button>
          
          <button
            onClick={() => {/* Add export functionality */}}
            style={{
              padding: '12px 20px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            💾 Export
          </button>
        </div>

        {/* Tabs */}
        <div style={{ 
          borderBottom: '1px solid #e2e8f0', 
          marginBottom: '24px',
          display: 'flex',
          gap: '24px'
        }}>
          {['overview', 'files', 'ai-analysis', 'comments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 0',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid #667eea' : '2px solid transparent',
                color: activeTab === tab ? '#667eea' : '#64748b',
                fontWeight: activeTab === tab ? '600' : '400',
                textTransform: 'capitalize'
              }}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="projects-section">
            <h3 style={{ marginBottom: '16px' }}>Design Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '12px' }}>Basic Information</h4>
                <p><strong>Type:</strong> {design.type}</p>
                <p><strong>Status:</strong> {design.status}</p>
                <p><strong>Version:</strong> {design.version}</p>
                <p><strong>Created by:</strong> {design.creator.firstName} {design.creator.lastName}</p>
              </div>
              
              {design.metadata && (
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '12px' }}>Metadata</h4>
                  {design.metadata.dimensions && (
                    <p><strong>Dimensions:</strong> {design.metadata.dimensions.width}x{design.metadata.dimensions.height}x{design.metadata.dimensions.depth} {design.metadata.dimensions.unit}</p>
                  )}
                  {design.metadata.materials && design.metadata.materials.length > 0 && (
                    <p><strong>Materials:</strong> {design.metadata.materials.join(', ')}</p>
                  )}
                  {design.metadata.style && (
                    <p><strong>Style:</strong> {design.metadata.style}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="projects-section">
            <h3 style={{ marginBottom: '16px' }}>Files</h3>
            {design.files && design.files.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {design.files.map((file, index) => (
                  <div key={index} style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                      {file.type === 'image' ? '🖼️' : '📄'}
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      {file.filename}
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                No files uploaded yet
              </p>
            )}
          </div>
        )}

        {activeTab === 'ai-analysis' && (
          <div className="projects-section">
            <h3 style={{ marginBottom: '16px' }}>AI Analysis</h3>
            {design.aiAnalysis ? (
              <div>
                {design.aiAnalysis.description && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '8px' }}>Description</h4>
                    <p style={{ color: '#64748b' }}>{design.aiAnalysis.description}</p>
                  </div>
                )}
                
                {design.aiAnalysis.suggestions && design.aiAnalysis.suggestions.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '8px' }}>Suggestions</h4>
                    <ul style={{ color: '#64748b' }}>
                      {design.aiAnalysis.suggestions.map((suggestion, index) => (
                        <li key={index} style={{ marginBottom: '4px' }}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {design.aiAnalysis.compliance && (
                  <div>
                    <h4 style={{ marginBottom: '8px' }}>Compliance Status</h4>
                    <div style={{ 
                      padding: '12px', 
                      borderRadius: '6px',
                      background: design.aiAnalysis.compliance.status === 'compliant' ? '#d1fae5' : '#fef3c7',
                      color: design.aiAnalysis.compliance.status === 'compliant' ? '#065f46' : '#92400e'
                    }}>
                      Status: {design.aiAnalysis.compliance.status}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                No AI analysis available yet
              </p>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="projects-section">
            <EnhancedComments 
              designId={designId}
              onCommentUpdate={() => {
                // Refresh design data if needed
                fetchDesignData();
              }}
            />
          </div>
        )}
      </main>

      {/* Sketch Editor Modal */}
      {showSketchEditor && (
        <SketchEditor
          designId={designId}
          onSave={(sketchData) => {
            setDesign({...design, sketchData});
            setShowSketchEditor(false);
          }}
          onClose={() => setShowSketchEditor(false)}
        />
      )}

      {/* 3D Viewer Modal */}
      {show3DViewer && (
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
                3D Design Viewer
              </h2>
              <button
                onClick={() => setShow3DViewer(false)}
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

            {/* 3D Viewer */}
            <div style={{ flex: 1, position: 'relative' }}>
              <Simple3DViewer
                modelData={design?.metadata}
                onModelUpdate={(update) => {
                  console.log('3D Model updated:', update);
                }}
                readOnly={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant */}
      <AIAssistant 
        designId={designId}
        onAnalysisUpdate={(analysis) => {
          // Update design with AI analysis
          setDesign(prev => ({
            ...prev,
            aiAnalysis: {
              ...prev.aiAnalysis,
              ...analysis,
              generatedAt: new Date(),
              model: 'AI Assistant'
            }
          }));
        }}
      />
    </div>
  );
};

export default DesignPage;
