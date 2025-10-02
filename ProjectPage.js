import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDesign, setShowNewDesign] = useState(false);
  const [newDesign, setNewDesign] = useState({
    name: '',
    type: 'sketch',
    description: ''
  });
  const [selectedDesigns, setSelectedDesigns] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchProjectData();
  }, [projectId, sortBy, sortOrder, filters]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [designs, filters, sortBy, sortOrder]);

  const fetchProjectData = async () => {
    try {
      const queryParams = new URLSearchParams({
        projectId,
        sortBy,
        sortOrder,
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const [projectRes, designsRes] = await Promise.all([
        axios.get(`/api/projects-crud/${projectId}`),
        axios.get(`/api/designs-crud?${queryParams}`)
      ]);
      
      setProject(projectRes.data.data.project);
      setDesigns(designsRes.data.data.designs);
      setFilteredDesigns(designsRes.data.data.designs);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
      toast.error('Failed to load project data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...designs];

    // Apply filters
    if (filters.search) {
      filtered = filtered.filter(design => 
        design.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (design.description && design.description.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }
    if (filters.type) {
      filtered = filtered.filter(design => design.type === filters.type);
    }
    if (filters.status) {
      filtered = filtered.filter(design => design.status === filters.status);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDesigns(filtered);
  };

  const handleCreateDesign = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/designs-crud', {
        ...newDesign,
        projectId
      });
      setDesigns([response.data.data.design, ...designs]);
      setShowNewDesign(false);
      setNewDesign({ name: '', type: 'sketch', description: '' });
      toast.success('Design created successfully!');
    } catch (error) {
      toast.error('Failed to create design');
    }
  };

  const handleDeleteDesign = async (designId) => {
    if (window.confirm('Are you sure you want to delete this design?')) {
      try {
        await axios.delete(`/api/designs-crud/${designId}`);
        setDesigns(designs.filter(d => d._id !== designId));
        toast.success('Design deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete design');
      }
    }
  };

  const handleDuplicateDesign = async (designId) => {
    try {
      const response = await axios.post(`/api/designs-crud/${designId}/duplicate`);
      setDesigns([response.data.data.design, ...designs]);
      toast.success('Design duplicated successfully!');
    } catch (error) {
      toast.error('Failed to duplicate design');
    }
  };

  const handleCreateVersion = async (designId) => {
    try {
      const response = await axios.post(`/api/designs-crud/${designId}/version`);
      setDesigns([response.data.data.design, ...designs]);
      toast.success('New version created successfully!');
    } catch (error) {
      toast.error('Failed to create new version');
    }
  };

  const handleExportDesign = async (designId) => {
    try {
      const response = await axios.get(`/api/designs-crud/${designId}/export`);
      const dataStr = JSON.stringify(response.data.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `design-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Design exported successfully!');
    } catch (error) {
      toast.error('Failed to export design');
    }
  };

  const handleBulkAction = async () => {
    if (selectedDesigns.length === 0) {
      toast.error('Please select designs first');
      return;
    }

    try {
      switch (bulkAction) {
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedDesigns.length} designs?`)) {
            await axios.delete('/api/designs-crud/bulk/delete', {
              data: { designIds: selectedDesigns }
            });
            setDesigns(designs.filter(d => !selectedDesigns.includes(d._id)));
            setSelectedDesigns([]);
            toast.success('Designs deleted successfully!');
          }
          break;
        case 'approve':
          await axios.patch('/api/designs-crud/bulk/status', {
            designIds: selectedDesigns,
            status: 'approved'
          });
          setDesigns(designs.map(d => 
            selectedDesigns.includes(d._id) ? { ...d, status: 'approved' } : d
          ));
          setSelectedDesigns([]);
          toast.success('Designs approved successfully!');
          break;
        case 'review':
          await axios.patch('/api/designs-crud/bulk/status', {
            designIds: selectedDesigns,
            status: 'review'
          });
          setDesigns(designs.map(d => 
            selectedDesigns.includes(d._id) ? { ...d, status: 'review' } : d
          ));
          setSelectedDesigns([]);
          toast.success('Designs moved to review successfully!');
          break;
        default:
          toast.error('Please select an action');
      }
    } catch (error) {
      toast.error('Failed to perform bulk action');
    }
    setBulkAction('');
  };

  const handleSelectDesign = (designId) => {
    setSelectedDesigns(prev => 
      prev.includes(designId) 
        ? prev.filter(id => id !== designId)
        : [...prev, designId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDesigns.length === filteredDesigns.length) {
      setSelectedDesigns([]);
    } else {
      setSelectedDesigns(filteredDesigns.map(d => d._id));
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'status-draft';
      case 'in-progress': return 'status-in-progress';
      case 'review': return 'status-review';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-draft';
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

  if (!project) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Project not found</h2>
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
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: '1px solid #e2e8f0',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <h1 className="dashboard-title">{project.name}</h1>
        </div>
      </header>

      <main className="dashboard-content">
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: '#64748b', marginBottom: '16px' }}>{project.description}</p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748b' }}>
            <span>Category: {project.category}</span>
            <span>Status: {project.status}</span>
            <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="projects-section">
          <div className="section-header">
            <h2 className="section-title">Designs</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {viewMode === 'grid' ? '📋' : '⊞'} {viewMode === 'grid' ? 'List' : 'Grid'}
              </button>
              <button
                onClick={() => setShowNewDesign(true)}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                + New Design
              </button>
            </div>
          </div>

          {/* Filters and Controls */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search designs..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                style={{
                  flex: '1',
                  minWidth: '200px',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              >
                <option value="">All Types</option>
                <option value="sketch">Sketch</option>
                <option value="2d">2D Design</option>
                <option value="3d">3D Model</option>
                <option value="rendering">Rendering</option>
                <option value="blueprint">Blueprint</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              >
                <option value="updatedAt">Last Updated</option>
                <option value="createdAt">Created Date</option>
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedDesigns.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontWeight: '500' }}>
                  {selectedDesigns.length} selected
                </span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                >
                  <option value="">Choose action...</option>
                  <option value="delete">Delete</option>
                  <option value="approve">Approve</option>
                  <option value="review">Move to Review</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    background: bulkAction ? '#dc2626' : '#d1d5db',
                    color: 'white',
                    cursor: bulkAction ? 'pointer' : 'not-allowed'
                  }}
                >
                  Apply
                </button>
                <button
                  onClick={() => setSelectedDesigns([])}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {showNewDesign && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginBottom: '16px' }}>Create New Design</h3>
              <form onSubmit={handleCreateDesign}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Design Name
                  </label>
                  <input
                    type="text"
                    value={newDesign.name}
                    onChange={(e) => setNewDesign({...newDesign, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Type
                  </label>
                  <select
                    value={newDesign.type}
                    onChange={(e) => setNewDesign({...newDesign, type: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="sketch">Sketch</option>
                    <option value="2d">2D Design</option>
                    <option value="3d">3D Model</option>
                    <option value="rendering">Rendering</option>
                    <option value="blueprint">Blueprint</option>
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Description
                  </label>
                  <textarea
                    value={newDesign.description}
                    onChange={(e) => setNewDesign({...newDesign, description: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      minHeight: '80px'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    style={{
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Create Design
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewDesign(false)}
                    style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Select All Checkbox */}
          {filteredDesigns.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedDesigns.length === filteredDesigns.length}
                  onChange={handleSelectAll}
                />
                <span>Select All ({filteredDesigns.length})</span>
              </label>
            </div>
          )}

          {filteredDesigns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>No designs found. {designs.length === 0 ? 'Create your first design to get started!' : 'Try adjusting your filters.'}</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'projects-grid' : 'projects-list'}>
              {filteredDesigns.map((design) => (
                <div
                  key={design._id}
                  className={`project-card ${viewMode === 'list' ? 'list-view' : ''}`}
                  style={{
                    position: 'relative',
                    border: selectedDesigns.includes(design._id) ? '2px solid #667eea' : '1px solid #e2e8f0'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      zIndex: 10
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDesigns.includes(design._id)}
                      onChange={() => handleSelectDesign(design._id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  
                  <div
                    onClick={() => navigate(`/design/${design._id}`)}
                    style={{ cursor: 'pointer', paddingLeft: '32px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{getTypeIcon(design.type)}</span>
                      <h3 className="project-title">{design.name}</h3>
                      {design.version > 1 && (
                        <span style={{
                          background: '#e0e7ff',
                          color: '#3730a3',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
                          v{design.version}
                        </span>
                      )}
                    </div>
                    <p className="project-description">{design.description}</p>
                    <div className="project-meta">
                      <span className={`project-status ${getStatusColor(design.status)}`}>
                        {design.status}
                      </span>
                      <span className="project-category">{design.type}</span>
                      <span>{new Date(design.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div
                    className="project-actions"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      display: 'flex',
                      gap: '4px',
                      opacity: 0,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateVersion(design._id);
                      }}
                      style={{
                        background: '#f0f9ff',
                        color: '#0369a1',
                        border: 'none',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                      title="New Version"
                    >
                      🔄
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateDesign(design._id);
                      }}
                      style={{
                        background: '#f3f4f6',
                        border: 'none',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                      title="Duplicate"
                    >
                      📋
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportDesign(design._id);
                      }}
                      style={{
                        background: '#f3f4f6',
                        border: 'none',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                      title="Export"
                    >
                      📤
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDesign(design._id);
                      }}
                      style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'draft': return 'status-draft';
    case 'in-progress': return 'status-in-progress';
    case 'approved': return 'status-completed';
    default: return 'status-draft';
  }
};

export default ProjectPage;


