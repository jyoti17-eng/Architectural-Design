import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const Simple3DViewer = ({ modelData, onModelUpdate, readOnly = false }) => {
  const [viewMode, setViewMode] = useState('perspective');
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (readOnly) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || readOnly) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setRotation(prev => ({
      x: prev.x + deltaY * 0.5,
      y: prev.y + deltaX * 0.5
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    if (readOnly) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  };

  const changeViewMode = (mode) => {
    setViewMode(mode);
    switch (mode) {
      case 'top':
        setRotation({ x: -90, y: 0 });
        break;
      case 'front':
        setRotation({ x: 0, y: 0 });
        break;
      case 'side':
        setRotation({ x: 0, y: 90 });
        break;
      case 'perspective':
      default:
        setRotation({ x: 20, y: 45 });
        break;
    }
  };

  const resetView = () => {
    setRotation({ x: 20, y: 45 });
    setZoom(1);
  };

  const exportModel = () => {
    toast.success('3D model export functionality would be implemented here');
  };

  // Generate building data if not provided
  const buildingData = modelData || {
    dimensions: { width: 10, height: 6, depth: 8 },
    materials: ['concrete', 'glass', 'steel'],
    style: 'modern',
    furniture: [
      { type: 'table', x: 2, y: 0, z: 2, width: 1, height: 0.8, depth: 1, color: '#8B4513' },
      { type: 'chair', x: 1, y: 0, z: 1, width: 0.5, height: 1, depth: 0.5, color: '#654321' },
      { type: 'sofa', x: -2, y: 0, z: 1, width: 2, height: 0.8, depth: 1, color: '#4169E1' }
    ]
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#f0f0f0' }}>
      {/* Toolbar */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 100,
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {/* View Controls */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'perspective', label: '🎯', title: 'Perspective' },
            { id: 'top', label: '⬆️', title: 'Top View' },
            { id: 'front', label: '👁️', title: 'Front View' },
            { id: 'side', label: '👀', title: 'Side View' }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => changeViewMode(view.id)}
              style={{
                padding: '6px 8px',
                border: viewMode === view.id ? '2px solid #667eea' : '1px solid #e2e8f0',
                borderRadius: '4px',
                background: viewMode === view.id ? '#f0f4ff' : 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title={view.title}
            >
              {view.label}
            </button>
          ))}
        </div>

        {/* Reset View */}
        <button
          onClick={resetView}
          style={{
            padding: '6px 8px',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🔄 Reset
        </button>

        {/* Export */}
        <button
          onClick={exportModel}
          style={{
            padding: '6px 8px',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          💾 Export
        </button>
      </div>

      {/* 3D Scene */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : (readOnly ? 'default' : 'grab'),
          overflow: 'hidden'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `
              perspective(1000px) 
              rotateX(${rotation.x}deg) 
              rotateY(${rotation.y}deg) 
              scale(${zoom})
            `,
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Building Structure */}
          <div style={{ position: 'relative', transformStyle: 'preserve-3d' }}>
            {/* Floor */}
            <div
              style={{
                position: 'absolute',
                width: `${buildingData.dimensions.width * 20}px`,
                height: `${buildingData.dimensions.depth * 20}px`,
                background: '#8B4513',
                transform: 'translateX(-50%) translateZ(-50%) rotateX(90deg)',
                border: '2px solid #654321'
              }}
            />

            {/* Walls */}
            {/* Front Wall */}
            <div
              style={{
                position: 'absolute',
                width: `${buildingData.dimensions.width * 20}px`,
                height: `${buildingData.dimensions.height * 20}px`,
                background: '#ffffff',
                transform: `translateX(-50%) translateZ(${buildingData.dimensions.depth * 10}px)`,
                border: '2px solid #cccccc'
              }}
            >
              {/* Windows */}
              <div
                style={{
                  position: 'absolute',
                  top: '20%',
                  left: '20%',
                  width: '15%',
                  height: '40%',
                  background: '#87CEEB',
                  border: '2px solid #4682B4'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '20%',
                  right: '20%',
                  width: '15%',
                  height: '40%',
                  background: '#87CEEB',
                  border: '2px solid #4682B4'
                }}
              />
              {/* Door */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '20%',
                  height: '60%',
                  background: '#8B4513',
                  border: '2px solid #654321'
                }}
              />
            </div>

            {/* Back Wall */}
            <div
              style={{
                position: 'absolute',
                width: `${buildingData.dimensions.width * 20}px`,
                height: `${buildingData.dimensions.height * 20}px`,
                background: '#ffffff',
                transform: `translateX(-50%) translateZ(${-buildingData.dimensions.depth * 10}px) rotateY(180deg)`,
                border: '2px solid #cccccc'
              }}
            />

            {/* Left Wall */}
            <div
              style={{
                position: 'absolute',
                width: `${buildingData.dimensions.depth * 20}px`,
                height: `${buildingData.dimensions.height * 20}px`,
                background: '#ffffff',
                transform: `translateX(${-buildingData.dimensions.width * 10}px) rotateY(-90deg)`,
                border: '2px solid #cccccc'
              }}
            />

            {/* Right Wall */}
            <div
              style={{
                position: 'absolute',
                width: `${buildingData.dimensions.depth * 20}px`,
                height: `${buildingData.dimensions.height * 20}px`,
                background: '#ffffff',
                transform: `translateX(${buildingData.dimensions.width * 10}px) rotateY(90deg)`,
                border: '2px solid #cccccc'
              }}
            />

            {/* Roof */}
            <div
              style={{
                position: 'absolute',
                width: `${buildingData.dimensions.width * 20}px`,
                height: `${buildingData.dimensions.depth * 20}px`,
                background: '#8B0000',
                transform: `translateX(-50%) translateY(${-buildingData.dimensions.height * 10}px) rotateX(90deg)`,
                border: '2px solid #654321'
              }}
            />

            {/* Furniture */}
            {buildingData.furniture && buildingData.furniture.map((item, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  width: `${item.width * 20}px`,
                  height: `${item.height * 20}px`,
                  background: item.color,
                  transform: `
                    translateX(${item.x * 20 - (buildingData.dimensions.width * 10)}px) 
                    translateY(${-item.y * 20}px) 
                    translateZ(${item.z * 20 - (buildingData.dimensions.depth * 10)}px)
                  `,
                  border: '1px solid #333',
                  borderRadius: '2px'
                }}
                title={item.type}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '14px',
        maxWidth: '300px'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>Building Information</div>
        <div style={{ color: '#64748b', marginBottom: '4px' }}>
          <strong>Dimensions:</strong> {buildingData.dimensions.width}m × {buildingData.dimensions.height}m × {buildingData.dimensions.depth}m
        </div>
        <div style={{ color: '#64748b', marginBottom: '4px' }}>
          <strong>Materials:</strong> {buildingData.materials.join(', ')}
        </div>
        <div style={{ color: '#64748b' }}>
          <strong>Style:</strong> {buildingData.style}
        </div>
        {!readOnly && (
          <div style={{ color: '#64748b', marginTop: '8px', fontSize: '12px' }}>
            💡 Drag to rotate • Scroll to zoom
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        display: 'none' // Hidden by default
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 10px'
        }} />
        <div>Loading 3D model...</div>
      </div>
    </div>
  );
};

export default Simple3DViewer;
