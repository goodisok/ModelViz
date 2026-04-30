import { useState, useCallback, useRef } from 'react'
import Scene from './components/Scene'
import Toolbar from './components/Toolbar'
import InfoPanel from './components/InfoPanel'
import DropZone from './components/DropZone'

const SUPPORTED_FORMATS = {
  glb: 'GLTF Binary',
  gltf: 'GLTF',
  obj: 'Wavefront OBJ',
  stl: 'STL',
  fbx: 'FBX',
  ply: 'PLY',
}

export default function App() {
  const [modelFile, setModelFile] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const [wireframe, setWireframe] = useState(false)
  const [gridVisible, setGridVisible] = useState(true)

  const handleFile = useCallback((file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    if (!SUPPORTED_FORMATS[ext]) {
      alert(`Unsupported format: .${ext}\nSupported: ${Object.keys(SUPPORTED_FORMATS).join(', ')}`)
      return
    }

    // Revoke old URL if exists
    if (modelFile?.url) URL.revokeObjectURL(modelFile.url)

    const url = URL.createObjectURL(file)
    setModelFile({ file, url, ext })
    setModelInfo({
      name: file.name,
      size: file.size,
      format: SUPPORTED_FORMATS[ext] || ext.toUpperCase(),
    })
  }, [modelFile])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleReset = useCallback(() => {
    if (modelFile?.url) URL.revokeObjectURL(modelFile.url)
    setModelFile(null)
    setModelInfo(null)
  }, [modelFile])

  const handleScreenshot = useCallback(() => {
    window.dispatchEvent(new CustomEvent('modelviz:capture'))
  }, [])

  const handleModelLoad = useCallback((stats) => {
    setModelInfo((prev) => prev ? { ...prev, ...stats } : stats)
  }, [])

  return (
    <div
      className="relative w-screen h-screen"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* 3D Viewport */}
      <Scene
        modelFile={modelFile}
        autoRotate={autoRotate}
        wireframe={wireframe}
        gridVisible={gridVisible}
        onModelLoad={handleModelLoad}
      />

      {/* Toolbar */}
      <Toolbar
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((v) => !v)}
        wireframe={wireframe}
        onToggleWireframe={() => setWireframe((v) => !v)}
        gridVisible={gridVisible}
        onToggleGrid={() => setGridVisible((v) => !v)}
        onScreenshot={handleScreenshot}
        onReset={handleReset}
        hasModel={!!modelFile}
      />

      {/* Info Panel */}
      {modelInfo && <InfoPanel info={modelInfo} />}

      {/* Drop Zone (shown when no model loaded) */}
      {!modelFile && <DropZone onFile={handleFile} />}
    </div>
  )
}
