import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeDViewer = ({ modelData, onModelUpdate, readOnly = false }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [viewMode, setViewMode] = useState('perspective');
  const [lighting, setLighting] = useState('default');

  useEffect(() => {
    if (mountRef.current) {
      initThreeJS();
      loadModel();
      
      return () => {
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (modelData && sceneRef.current) {
      loadModel();
    }
  }, [modelData]);

  const initThreeJS = () => {
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting
    setupLighting();

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);
  };

  const setupLighting = () => {
    if (!sceneRef.current) return;

    // Clear existing lights
    const lights = sceneRef.current.children.filter(child => child.type === 'Light');
    lights.forEach(light => sceneRef.current.remove(light));

    if (lighting === 'default') {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      sceneRef.current.add(ambientLight);

      // Directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      sceneRef.current.add(directionalLight);
    } else if (lighting === 'studio') {
      // Studio lighting setup
      const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
      sceneRef.current.add(ambientLight);

      // Key light
      const keyLight = new THREE.DirectionalLight(0xffffff, 1);
      keyLight.position.set(5, 5, 5);
      keyLight.castShadow = true;
      sceneRef.current.add(keyLight);

      // Fill light
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
      fillLight.position.set(-5, 0, 5);
      sceneRef.current.add(fillLight);

      // Rim light
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
      rimLight.position.set(0, 5, -5);
      sceneRef.current.add(rimLight);
    }
  };

  const loadModel = () => {
    if (!sceneRef.current || !modelData) return;

    setIsLoading(true);

    // Clear existing models
    const models = sceneRef.current.children.filter(child => 
      child.type === 'Group' || child.type === 'Mesh'
    );
    models.forEach(model => {
      if (model.type !== 'GridHelper') {
        sceneRef.current.remove(model);
      }
    });

    try {
      // Create a simple building model based on data
      createBuildingModel(modelData);
    } catch (error) {
      console.error('Error loading model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createBuildingModel = (data) => {
    const group = new THREE.Group();

    // Create walls
    if (data.dimensions) {
      const { width, height, depth } = data.dimensions;
      
      // Floor
      const floorGeometry = new THREE.PlaneGeometry(width, depth);
      const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      group.add(floor);

      // Walls
      const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
      
      // Front wall
      const frontWallGeometry = new THREE.PlaneGeometry(width, height);
      const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
      frontWall.position.set(0, height / 2, depth / 2);
      group.add(frontWall);

      // Back wall
      const backWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
      backWall.position.set(0, height / 2, -depth / 2);
      backWall.rotation.y = Math.PI;
      group.add(backWall);

      // Left wall
      const leftWallGeometry = new THREE.PlaneGeometry(depth, height);
      const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
      leftWall.position.set(-width / 2, height / 2, 0);
      leftWall.rotation.y = Math.PI / 2;
      group.add(leftWall);

      // Right wall
      const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
      rightWall.position.set(width / 2, height / 2, 0);
      rightWall.rotation.y = -Math.PI / 2;
      group.add(rightWall);

      // Roof
      const roofGeometry = new THREE.PlaneGeometry(width, depth);
      const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(0, height, 0);
      roof.rotation.x = Math.PI / 2;
      group.add(roof);
    }

    // Add windows and doors
    addWindowsAndDoors(group, data);

    // Add furniture if specified
    if (data.furniture) {
      addFurniture(group, data.furniture);
    }

    sceneRef.current.add(group);

    // Enable object selection
    if (!readOnly) {
      enableObjectSelection(group);
    }
  };

  const addWindowsAndDoors = (group, data) => {
    // Simple window representation
    const windowGeometry = new THREE.PlaneGeometry(1, 1.5);
    const windowMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x87CEEB,
      transparent: true,
      opacity: 0.7
    });

    // Add windows to front wall
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(-2, 2, 2.01);
    group.add(window1);

    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    window2.position.set(2, 2, 2.01);
    group.add(window2);

    // Door
    const doorGeometry = new THREE.PlaneGeometry(1, 2.5);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.25, 2.01);
    group.add(door);
  };

  const addFurniture = (group, furniture) => {
    furniture.forEach(item => {
      const geometry = new THREE.BoxGeometry(item.width, item.height, item.depth);
      const material = new THREE.MeshLambertMaterial({ color: item.color || 0x654321 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(item.x, item.y, item.z);
      mesh.castShadow = true;
      group.add(mesh);
    });
  };

  const enableObjectSelection = (group) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(group.children, true);

      if (intersects.length > 0) {
        const selected = intersects[0].object;
        setSelectedObject(selected);
        
        // Highlight selected object
        selected.material.emissive = new THREE.Color(0x444444);
        
        if (onModelUpdate) {
          onModelUpdate({ selectedObject: selected, action: 'select' });
        }
      }
    };

    mountRef.current.addEventListener('click', onMouseClick);
  };

  const changeViewMode = (mode) => {
    setViewMode(mode);
    
    if (cameraRef.current) {
      switch (mode) {
        case 'top':
          cameraRef.current.position.set(0, 20, 0);
          cameraRef.current.lookAt(0, 0, 0);
          break;
        case 'front':
          cameraRef.current.position.set(0, 0, 20);
          cameraRef.current.lookAt(0, 0, 0);
          break;
        case 'side':
          cameraRef.current.position.set(20, 0, 0);
          cameraRef.current.lookAt(0, 0, 0);
          break;
        case 'perspective':
        default:
          cameraRef.current.position.set(10, 10, 10);
          cameraRef.current.lookAt(0, 0, 0);
          break;
      }
    }
  };

  const changeLighting = (lightType) => {
    setLighting(lightType);
    setupLighting();
  };

  const exportModel = () => {
    if (sceneRef.current) {
      // Export as GLTF or OBJ
      toast.success('3D model export functionality would be implemented here');
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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

        {/* Lighting Controls */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <select
            value={lighting}
            onChange={(e) => changeLighting(e.target.value)}
            style={{
              padding: '6px 8px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              background: 'white',
              fontSize: '12px'
            }}
          >
            <option value="default">💡 Default</option>
            <option value="studio">🎬 Studio</option>
          </select>
        </div>

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

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 200,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
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
      )}

      {/* Info Panel */}
      {selectedObject && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '14px',
          maxWidth: '200px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Selected Object</div>
          <div style={{ color: '#64748b' }}>
            Type: {selectedObject.type}
          </div>
          <div style={{ color: '#64748b' }}>
            Position: {selectedObject.position.x.toFixed(2)}, {selectedObject.position.y.toFixed(2)}, {selectedObject.position.z.toFixed(2)}
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default ThreeDViewer;


