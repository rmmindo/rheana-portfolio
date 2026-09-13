import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

const map2D = (x, y) => [(x - 50) * 0.4, (50 - y) * 0.4, 0];

const parseSVGPath = (pathStr) => {
  const parts = pathStr.split(' ');
  const points = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === 'M' || parts[i] === 'L') continue;
    const [x, y] = parts[i].split(',').map(Number);
    if (!isNaN(x) && !isNaN(y)) points.push(map2D(x, y));
  }
  return points;
};

const createCurvePath = (pointsArray) => {
  const curvePath = new THREE.CurvePath();
  const vPoints = pointsArray.map(p => new THREE.Vector3(...p));
  for (let i = 0; i < vPoints.length - 1; i++) {
    curvePath.add(new THREE.LineCurve3(vPoints[i], vPoints[i+1]));
  }
  return curvePath;
};

const pcbCategories = {
  work: { 
    color: '#38BDF8',
    path: "M 50,8 L 50,25 L 55,30 L 60,30 L 65,35 L 65,45 L 65,55 L 55,65 L 45,65 L 40,60 L 30,60 L 30,65 L 30,75 L 35,70 L 45,70 L 50,75 L 55,75 L 60,75 L 65,80 L 70,80 L 75,85 L 75,92",
    nodes: [
      { pos2D: [50, 25] },
      { pos2D: [65, 45] },
      { pos2D: [30, 65] },
      { pos2D: [55, 75] },
      { pos2D: [65, 80] },
      { pos2D: [75, 85] }
    ]
  },
  voluntary: { 
    color: '#F59E0B',
    path: "M 85,20 L 75,20 L 70,25 L 60,25 L 50,15 L 45,15 L 30,15 L 25,20 L 25,30 L 30,35 L 30,40 L 25,45 L 25,50 L 35,60 L 45,60 L 50,65 L 50,75 L 45,80 L 35,80 L 25,80 L 20,85 L 20,90",
    nodes: [
      { pos2D: [45, 15] },
      { pos2D: [25, 45] },
      { pos2D: [35, 80] }
    ]
  },
  awards: { 
    color: '#A78BFA',
    path: "M 80,75 L 70,75 L 65,70 L 55,70",
    nodes: [
      { pos2D: [70, 75] },
      { pos2D: [55, 70] }
    ]
  },
  dec1: {
    color: '#F59E0B',
    path: "M 85,35 L 80,40 L 80,45 L 85,50 L 85,55",
    nodes: [ { pos2D: [85, 35] }, { pos2D: [85, 55] } ]
  },
  dec2: {
    color: '#F59E0B',
    path: "M 45,95 L 50,90 L 60,90",
    nodes: [ { pos2D: [45, 95] }, { pos2D: [60, 90] } ]
  },
  dec3: {
    color: '#F59E0B',
    path: "M 20,0 L 20,5 L 30,15",
    nodes: [ { pos2D: [30, 15] } ]
  },
  dec4: {
    color: '#F59E0B',
    path: "M 0,35 L 10,35 L 20,45 L 20,55 L 10,65 L 0,65",
    nodes: []
  },
  dec5: {
    color: '#F59E0B',
    path: "M 75,65 L 75,60 L 70,55",
    nodes: [ { pos2D: [75, 65] }, { pos2D: [70, 55] } ]
  }
};

const NodeCard = ({ data, categoryKey }) => {
  if (!data) return null;
  return (
    <div className="soc-med-card" style={{ 
      width: '320px', 
      pointerEvents: 'auto', 
      background: 'rgba(20, 25, 35, 0.75)', 
      backdropFilter: 'blur(12px)', 
      WebkitBackdropFilter: 'blur(12px)',
      border: `1px solid ${pcbCategories[categoryKey]?.color || '#fff'}`, 
      borderRadius: '12px', 
      padding: '16px', 
      color: '#fff', 
      fontSize: '13px',
      boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 10px ${pcbCategories[categoryKey]?.color}40`,
      transform: 'translate(20px, -20px)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
        <div style={{ 
          width: '36px', height: '36px', 
          borderRadius: '8px', 
          background: pcbCategories[categoryKey]?.color || '#fff', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontWeight: 'bold', color: '#000', marginRight: '12px',
          fontSize: '16px'
        }}>
          {data.org ? data.org.charAt(0) : data.title.charAt(0)}
        </div>
        <div>
          <strong style={{ display: 'block', fontSize: '15px' }}>{data.org || data.title}</strong>
          <span style={{ opacity: 0.7, fontSize: '12px' }}>{data.dates}</span>
        </div>
      </div>
      <div>
        <strong style={{ color: pcbCategories[categoryKey]?.color, display: 'block', marginBottom: '6px' }}>
          {data.title || 'Role'}
        </strong>
        {data.bullets && data.bullets[0] && (
          <p style={{ margin: 0, opacity: 0.9, lineHeight: '1.5' }} 
             dangerouslySetInnerHTML={{ __html: data.bullets[0].text.length > 150 ? data.bullets[0].text.substring(0, 150) + '...' : data.bullets[0].text }} />
        )}
      </div>
    </div>
  );
};

function Node({ position, color, isActive, scrollProgress, curvePath, nodeData, categoryKey }) {
  const nodeRef = useRef();
  const [pulseActive, setPulseActive] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame(() => {
    if (nodeRef.current) {
      nodeRef.current.position.z = position[2];
      
      if (isActive) {
        const pulsePos = curvePath.getPointAt(scrollProgress);
        const nodeVec = new THREE.Vector3(...position).setZ(0);
        pulsePos.setZ(0);
        const dist = nodeVec.distanceTo(pulsePos);
        setPulseActive(dist < 2.0); // Activate if pulse is close
      } else {
        setPulseActive(false);
        setClicked(false);
      }
    }
  });

  const isNodeActive = pulseActive || clicked;

  return (
    <group ref={nodeRef} position={position}>
      <mesh 
        onClick={(e) => {
          e.stopPropagation();
          setClicked(!clicked);
        }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color={isActive ? color : '#555'} transparent opacity={isActive ? 1 : 0.3} />
      </mesh>
      {isActive && (
        <mesh position={[0, 0, -0.1]}>
          <circleGeometry args={[0.8, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}
      
      {/* Card Popup */}
      <Html zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{ 
          opacity: isNodeActive ? 1 : 0, 
          transform: `scale(${isNodeActive ? 1 : 0.8})`, 
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          pointerEvents: isNodeActive ? 'auto' : 'none'
        }}>
          {isNodeActive && nodeData && <NodeCard data={nodeData} categoryKey={categoryKey} />}
        </div>
      </Html>
    </group>
  );
}

function Track({ categoryKey, data, isActive, scrollProgress, entries, setActiveCategory }) {
  const lineRef = useRef();
  const particleRef = useRef();

  const points = useMemo(() => parseSVGPath(data.path), [data.path]);
  const curvePath = useMemo(() => createCurvePath(points), [points]);

  const targetZ = isActive ? 1.5 : 0;
  const targetOpacity = isActive ? 1.0 : 0.15;

  useFrame((state, delta) => {
    if (lineRef.current) {
      lineRef.current.position.z = THREE.MathUtils.damp(lineRef.current.position.z, targetZ, 4, delta);
      lineRef.current.material.opacity = THREE.MathUtils.damp(lineRef.current.material.opacity, targetOpacity, 4, delta);
    }
    if (particleRef.current && isActive) {
      const p = curvePath.getPointAt(scrollProgress);
      if (p) {
        particleRef.current.position.copy(p);
        particleRef.current.position.z = targetZ + 0.2;
      }
    }
  });

  return (
    <group>
      <Line
        ref={lineRef}
        points={points}
        color={data.color}
        lineWidth={isActive ? 3 : 1}
        transparent
        opacity={targetOpacity}
        onClick={(e) => {
          e.stopPropagation();
          setActiveCategory && setActiveCategory(categoryKey);
        }}
        onPointerOver={() => {
          if (!isActive) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      />
      
      {/* Scroll Pulse Particle */}
      {isActive && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
          <pointLight color={data.color} intensity={2} distance={8} />
        </mesh>
      )}

      {/* Nodes */}
      {data.nodes.map((n, i) => {
        const [x, y, z] = map2D(n.pos2D[0], n.pos2D[1]);
        return (
          <Node 
            key={i} 
            position={[x, y, targetZ]} 
            color={data.color} 
            isActive={isActive} 
            scrollProgress={scrollProgress}
            curvePath={curvePath}
            nodeData={entries?.[i]}
            categoryKey={categoryKey}
          />
        );
      })}
    </group>
  );
}

function CameraController({ activeCategory, scrollProgress }) {
  const { camera } = useThree();
  
  useFrame((state, delta) => {
    let targetZ = 32;
    let targetX = 0;
    let targetY = 0;

    // Macro View Transition
    if (scrollProgress > 0.95) {
      targetZ = 42; 
    } else {
      targetZ = 28;
      if (activeCategory === 'work') targetX = 2;
      if (activeCategory === 'voluntary') targetX = -2;
      if (activeCategory === 'foundation') {
        targetX = 0;
        targetY = 2;
        targetZ = 20;
      }
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2, delta);
  });

  return null;
}

export default function PCBCanvas({ activeCategory, setActiveCategory, scrollProgress, workData, volData, projData }) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#080c14' }}>
      <Canvas camera={{ position: [0, 0, 32], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 20]} intensity={1.5} />
        
        <CameraController activeCategory={activeCategory} scrollProgress={scrollProgress} />

        {/* Substrate */}
        <mesh position={[0, 0, -2]}>
          <planeGeometry args={[70, 70]} />
          <meshStandardMaterial color="#0a1a12" roughness={0.9} /> {/* Deep Chassis / PCB Green */}
        </mesh>

        {/* Foundation Core */}
        <group position={[0, 0, activeCategory === 'foundation' ? 2 : 0]}>
          <mesh 
            onClick={(e) => { e.stopPropagation(); setActiveCategory && setActiveCategory('foundation'); }}
            onPointerOver={() => { if (activeCategory !== 'foundation') document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
          >
            <boxGeometry args={[8, 8, 0.5]} />
            <meshStandardMaterial 
              color={activeCategory === 'foundation' ? '#ffffff' : '#222222'} 
              transparent 
              opacity={activeCategory === 'foundation' ? 0.9 : 0.3} 
              roughness={0.2}
            />
          </mesh>
          <Html center zIndexRange={[100, 0]}>
            <div style={{ 
              color: activeCategory === 'foundation' ? '#000' : '#fff', 
              fontWeight: 'bold', 
              fontSize: '18px',
              textAlign: 'center',
              opacity: activeCategory === 'foundation' ? 1 : 0.2,
              transition: 'all 0.4s',
              pointerEvents: 'none'
            }}>
              Foundation<br/>Core
            </div>
            {activeCategory === 'foundation' && (
              <div style={{
                position: 'absolute', top: '100%', left: '50%', transform: 'translate(-50%, 20px)',
                width: '280px', background: 'rgba(255,255,255,0.9)', color: '#000', padding: '12px',
                borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', textAlign: 'center'
              }}>
                <strong>B.S. Computer Science</strong><br/>
                <span style={{ fontSize: '13px' }}>UPLB (July 2025)</span><br/><br/>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>Magna Cum Laude</span>
              </div>
            )}
          </Html>
        </group>

        {/* Tracks */}
        <Track categoryKey="work" data={pcbCategories.work} isActive={activeCategory === 'work'} scrollProgress={scrollProgress} entries={workData} setActiveCategory={setActiveCategory} />
        <Track categoryKey="voluntary" data={pcbCategories.voluntary} isActive={activeCategory === 'voluntary'} scrollProgress={scrollProgress} entries={volData} setActiveCategory={setActiveCategory} />
        <Track categoryKey="awards" data={pcbCategories.awards} isActive={activeCategory === 'awards'} scrollProgress={scrollProgress} entries={projData} setActiveCategory={setActiveCategory} />
        <Track categoryKey="dec1" data={pcbCategories.dec1} isActive={false} scrollProgress={0} entries={[]} />
        <Track categoryKey="dec2" data={pcbCategories.dec2} isActive={false} scrollProgress={0} entries={[]} />
        <Track categoryKey="dec3" data={pcbCategories.dec3} isActive={false} scrollProgress={0} entries={[]} />
        <Track categoryKey="dec4" data={pcbCategories.dec4} isActive={false} scrollProgress={0} entries={[]} />
        <Track categoryKey="dec5" data={pcbCategories.dec5} isActive={false} scrollProgress={0} entries={[]} />

      </Canvas>
    </div>
  );
}
