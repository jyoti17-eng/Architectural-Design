import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';

const DrawingCanvas = ({ onSave, initialData, readOnly = false }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(2);
  const [brushColor, setBrushColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        isDrawingMode: !readOnly
      });

      fabricCanvasRef.current = canvas;

      // Load initial data if provided
      if (initialData) {
        canvas.loadFromJSON(initialData, () => {
          canvas.renderAll();
        });
      }

      // Configure drawing settings
      canvas.freeDrawingBrush.width = brushSize;
      canvas.freeDrawingBrush.color = brushColor;

      // Handle drawing events
      canvas.on('path:created', (e) => {
        if (!readOnly) {
          const path = e.path;
          path.set({
            stroke: brushColor,
            strokeWidth: brushSize,
            selectable: !readOnly,
            evented: !readOnly
          });
        }
      });

      // Handle object selection
      canvas.on('selection:created', (e) => {
        if (readOnly) {
          canvas.discardActiveObject();
        }
      });

      return () => {
        canvas.dispose();
      };
    }
  }, [readOnly]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.freeDrawingBrush.width = brushSize;
      fabricCanvasRef.current.freeDrawingBrush.color = brushColor;
      fabricCanvasRef.current.isDrawingMode = selectedTool === 'pen' && !readOnly;
    }
  }, [brushSize, brushColor, selectedTool, readOnly]);

  const handleToolChange = (tool) => {
    setSelectedTool(tool);
    if (fabricCanvasRef.current) {
      switch (tool) {
        case 'pen':
          fabricCanvasRef.current.isDrawingMode = true;
          break;
        case 'select':
          fabricCanvasRef.current.isDrawingMode = false;
          break;
        case 'text':
          addText();
          break;
        case 'rectangle':
          addRectangle();
          break;
        case 'circle':
          addCircle();
          break;
        case 'line':
          addLine();
          break;
        case 'arrow':
          addArrow();
          break;
        default:
          fabricCanvasRef.current.isDrawingMode = false;
      }
    }
  };

  const addText = () => {
    if (fabricCanvasRef.current && !readOnly) {
      const text = new fabric.IText('Click to edit text', {
        left: 100,
        top: 100,
        fontFamily: 'Arial',
        fontSize: 20,
        fill: brushColor
      });
      fabricCanvasRef.current.add(text);
      fabricCanvasRef.current.setActiveObject(text);
    }
  };

  const addRectangle = () => {
    if (fabricCanvasRef.current && !readOnly) {
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: 'transparent',
        stroke: brushColor,
        strokeWidth: brushSize
      });
      fabricCanvasRef.current.add(rect);
    }
  };

  const addCircle = () => {
    if (fabricCanvasRef.current && !readOnly) {
      const circle = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: 'transparent',
        stroke: brushColor,
        strokeWidth: brushSize
      });
      fabricCanvasRef.current.add(circle);
    }
  };

  const addLine = () => {
    if (fabricCanvasRef.current && !readOnly) {
      const line = new fabric.Line([50, 100, 200, 100], {
        stroke: brushColor,
        strokeWidth: brushSize
      });
      fabricCanvasRef.current.add(line);
    }
  };

  const addArrow = () => {
    if (fabricCanvasRef.current && !readOnly) {
      const arrow = new fabric.Line([50, 100, 200, 100], {
        stroke: brushColor,
        strokeWidth: brushSize,
        strokeDashArray: [5, 5]
      });
      fabricCanvasRef.current.add(arrow);
    }
  };

  const clearCanvas = () => {
    if (fabricCanvasRef.current && !readOnly) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = '#ffffff';
      fabricCanvasRef.current.renderAll();
    }
  };

  const undo = () => {
    if (fabricCanvasRef.current && !readOnly) {
      const objects = fabricCanvasRef.current.getObjects();
      if (objects.length > 0) {
        fabricCanvasRef.current.remove(objects[objects.length - 1]);
        fabricCanvasRef.current.renderAll();
      }
    }
  };

  const saveCanvas = () => {
    if (fabricCanvasRef.current && onSave) {
      const canvasData = fabricCanvasRef.current.toJSON();
      onSave(canvasData);
    }
  };

  const exportAsImage = () => {
    if (fabricCanvasRef.current) {
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1
      });
      
      const link = document.createElement('a');
      link.download = 'sketch.png';
      link.href = dataURL;
      link.click();
    }
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
              { id: 'select', label: '↖️ Select', title: 'Select' },
              { id: 'text', label: '📝 Text', title: 'Add Text' },
              { id: 'rectangle', label: '⬜ Rectangle', title: 'Rectangle' },
              { id: 'circle', label: '⭕ Circle', title: 'Circle' },
              { id: 'line', label: '📏 Line', title: 'Line' },
              { id: 'arrow', label: '➡️ Arrow', title: 'Arrow' }
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolChange(tool.id)}
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
              onClick={undo}
              style={{
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ↶ Undo
            </button>
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
        <canvas ref={canvasRef} />
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

export default DrawingCanvas;


