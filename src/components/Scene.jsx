import { Suspense, Component } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import ModelViewer from './ModelViewer'
import ScreenshotCapture from './ScreenshotCapture'

// Error boundary for Environment to prevent WebGL context loss
class SafeEnvironment extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) return null
    return (
      <Suspense fallback={null}>
        <Environment preset="city" background={false} />
      </Suspense>
    )
  }
}

function SceneContent({ modelFile, autoRotate, wireframe, gridVisible, onModelLoad }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-3, 4, -3]} intensity={0.4} />
      <hemisphereLight args={['#b1e1ff', '#3a3a3a', 0.6]} />

      {/* Environment (wrapped in error boundary) */}
      <SafeEnvironment />

      {/* Grid */}
      {gridVisible && (
        <group>
          <gridHelper args={[20, 20, '#52525b', '#3f3f46']} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <shadowMaterial transparent opacity={0.15} />
          </mesh>
        </group>
      )}

      {/* Model */}
      {modelFile && (
        <Suspense fallback={null}>
          <ModelViewer
            url={modelFile.url}
            ext={modelFile.ext}
            wireframe={wireframe}
            onLoad={onModelLoad}
          />
        </Suspense>
      )}

      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.1}
        autoRotate={autoRotate}
        autoRotateSpeed={2}
        minDistance={0.5}
        maxDistance={50}
      />

      {/* Screenshot capture (inside Canvas for useThree access) */}
      <ScreenshotCapture />
    </>
  )
}

export default function Scene(props) {
  return (
    <Canvas
      camera={{ position: [4, 3, 4], fov: 45, near: 0.1, far: 100 }}
      gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 1.2 }}
      style={{ width: '100vw', height: '100vh' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#18181b')
      }}
    >
      <SceneContent {...props} />
    </Canvas>
  )
}
