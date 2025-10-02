import React, { useRef, useEffect, useState } from 'react';

const SimpleDrawingCanvas = ({ onSave, initialData, readOnly = false }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(2);
  const [brushColor, setBrushColor] = useState('#000000');
  const [startPos, setStartPos] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Load initial data if provided
    if (initialData && initialData.imageData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialData.imageData;
    }
  }, [initialData]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (readOnly) return;
    
    setIsDrawing(true);
    const pos = getMousePos(e);
    setStartPos(pos);
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing || readOnly) return;
    
    const pos = getMousePos(e);
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    
    if (selectedTool === 'pen') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (selectedTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (readOnly) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    
    const canvasData = {
      imageData: dataURL,
      timestamp: new Date().toISOString()
    };
    
    if (onSave) {
      onSave(canvasData);
    }
  };

  const exportAsImage = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = 'sketch.png';
    link.href = dataURL;
    link.click();
  };

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Toolbar */}
      {!readOnly && (
        <div style={{
          background: '#f8fafc',
          padding: '12px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Drawing Tools */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'pen', label: '✏️ Pen', title: 'Draw' },
              { id: 'eraser', label: '🧽 Eraser', title: 'Erase' }
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                style={{
                  padding: '8px 12px',
                  border: selectedTool === tool.id ? '2px solid #667eea' : '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background: selectedTool === tool.id ? '#f0f4ff' : 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                title={tool.title}
              >
                {tool.label}
              </button>
            ))}
          </div>

          {/* Brush Settings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              style={{ width: '80px' }}
            />
            <span style={{ fontSize: '12px', color: '#64748b' }}>{brushSize}px</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Color:</label>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              style={{ width: '40px', height: '32px', border: 'none', borderRadius: '4px' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button
              onClick={clearCanvas}
              style={{
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🗑️ Clear
            </button>
            <button
              onClick={exportAsImage}
              style={{
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              💾 Export
            </button>
            <button
              onClick={saveCanvas}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: '6px',
                background: '#667eea',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              💾 Save
            </button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div style={{ display: 'flex', justifyContent: 'center', background: '#ffffff' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            cursor: readOnly ? 'default' : (selectedTool === 'pen' ? 'crosshair' : 'grab'),
            border: '1px solid #e2e8f0'
          }}
        />
      </div>

      {readOnly && (
        <div style={{
          padding: '12px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '14px'
        }}>
          Read-only mode - Viewing only
        </div>
      )}
    </div>
  );
};

export default SimpleDrawingCanvas;


