import { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'

/**
 * CadModelViewer — loads STEP (.stp/.step) and IGES (.iges/.igs) files
 * using occt-import-js (OpenCASCADE compiled to WASM).
 * Supports large assemblies (200+ sub-meshes) via batched rendering.
 */
export default function CadModelViewer({ url, ext, wireframe, onLoad }) {
  const [occt, setOcct] = useState(null)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)
  const groupRef = useRef()
  const loadedRef = useRef(false)
  const wireframeRef = useRef({}) // mesh uuid → orig material

  // ── 1. Lazy-init WASM (once) ──
  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const occtimportjs = await import('occt-import-js')
        const loader = occtimportjs.default || occtimportjs
        if (typeof loader !== 'function') {
          throw new Error('occt-import-js loader type mismatch')
        }
        const instance = await loader()
        if (!cancelled) setOcct(instance)
      } catch (err) {
        if (!cancelled) {
          console.error('CAD WASM init failed:', err)
          setError('CAD loader initialization failed. Check browser console.')
        }
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  // ── 2. Load & parse CAD file ──
  useEffect(() => {
    if (!occt || !url) return
    const group = groupRef.current
    if (!group || loadedRef.current) return

    async function load() {
      try {
        setProgress({ current: 0, total: 0, phase: 'fetching' })
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const buffer = await response.arrayBuffer()
        const fileBuffer = new Uint8Array(buffer)

        setProgress({ current: 0, total: 0, phase: 'parsing' })
        // Parse STEP or IGES
        let result
        if (ext === 'stp' || ext === 'step') {
          result = occt.ReadStepFile(fileBuffer, null)
        } else if (ext === 'iges' || ext === 'igs') {
          result = occt.ReadIgesFile(fileBuffer, null)
        }
        if (!result) throw new Error('Parsing returned null')
        if (!result.meshes || result.meshes.length === 0) {
          throw new Error('File parsed but contains no mesh data')
        }

        const totalMeshes = result.meshes.length

        // Precompute global bounding box
        const box = new THREE.Box3()
        for (const rm of result.meshes) {
          const pos = rm.attributes.position.array
          for (let i = 0; i < pos.length; i += 3) {
            box.expandByPoint(new THREE.Vector3(pos[i], pos[i + 1], pos[i + 2]))
          }
        }
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = maxDim > 0 ? 2 / maxDim : 1

        // Batched rendering — 10 meshes per frame to keep UI responsive
        let index = 0
        function addNextBatch() {
          const batchSize = 10
          let count = 0

          while (index < totalMeshes && count < batchSize) {
            const rm = result.meshes[index]
            const geometry = new THREE.BufferGeometry()
            geometry.setAttribute(
              'position',
              new THREE.Float32BufferAttribute(rm.attributes.position.array, 3)
            )
            if (rm.attributes.normal) {
              geometry.setAttribute(
                'normal',
                new THREE.Float32BufferAttribute(rm.attributes.normal.array, 3)
              )
            }
            geometry.setIndex(
              new THREE.BufferAttribute(Uint32Array.from(rm.index.array), 1)
            )

            // B-Rep face color groups
            if (rm.brep_faces && rm.brep_faces.length > 0) {
              for (const face of rm.brep_faces) {
                geometry.addGroup(face.first, face.last - face.first + 1, 0)
              }
            }

            const color = rm.color
              ? new THREE.Color(rm.color[0], rm.color[1], rm.color[2])
              : new THREE.Color('#aaaaaa')

            const material = new THREE.MeshStandardMaterial({
              metalness: 0.3,
              roughness: 0.6,
              side: THREE.DoubleSide,
              color,
            })

            const mesh = new THREE.Mesh(geometry, material)
            mesh.name = rm.name || `mesh_${index}`
            mesh.position.sub(center)
            mesh.scale.setScalar(scale)
            group.add(mesh)

            index++
            count++
          }

          setProgress({ current: index, total: totalMeshes, phase: 'rendering' })
          onLoad?.({
            meshes: totalMeshes,
            vertices: totalMeshes > 0
              ? `~${Math.round(box.getSize(new THREE.Vector3()).length() * 10)} units`
              : 'unknown',
          })

          if (index < totalMeshes) {
            requestAnimationFrame(addNextBatch)
          } else {
            loadedRef.current = true
            setProgress(null)
          }
        }

        requestAnimationFrame(addNextBatch)
      } catch (err) {
        console.error('CAD load failed:', err)
        setError(`Failed to load ${ext.toUpperCase()} file: ${err.message}`)
        setProgress(null)
      }
    }

    load()
  }, [occt, url, ext])

  // ── 3. Wireframe toggle ──
  useEffect(() => {
    const group = groupRef.current
    if (!group || !loadedRef.current) return

    if (wireframe) {
      group.traverse((child) => {
        if (child.isMesh && !wireframeRef.current[child.uuid]) {
          wireframeRef.current[child.uuid] = child.material.clone()
          const wf = child.material.clone()
          wf.wireframe = true
          wf.color.set('#a78bfa')
          child.material = wf
          child.material.needsUpdate = true
        }
      })
    } else {
      group.traverse((child) => {
        if (child.isMesh && wireframeRef.current[child.uuid]) {
          child.material = wireframeRef.current[child.uuid].clone()
          child.material.needsUpdate = true
          delete wireframeRef.current[child.uuid]
        }
      })
    }
  }, [wireframe])

  // ── 4. Render ──
  if (error) {
    return (
      <mesh>
        <ErrorOverlay message={error} />
      </mesh>
    )
  }

  return (
    <>
      <group ref={groupRef} />
      {progress && <ProgressOverlay {...progress} />}
    </>
  )
}

function ErrorOverlay({ message }) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgba(0,0,0,0.85)'
  ctx.fillRect(0, 0, 512, 128)
  ctx.fillStyle = '#ef4444'
  ctx.font = '20px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('⚠ ' + message, 256, 50)
  ctx.fillStyle = '#9ca3af'
  ctx.font = '14px monospace'
  ctx.fillText('Check browser console for details', 256, 80)
  const texture = new THREE.CanvasTexture(canvas)
  return (
    <>
      <planeGeometry args={[5, 1.25]} />
      <meshBasicMaterial map={texture} transparent />
    </>
  )
}

function ProgressOverlay({ current, total, phase }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  const label = phase === 'fetching'
    ? 'Downloading...'
    : phase === 'parsing'
    ? 'Parsing CAD data...'
    : `Loading meshes: ${current}/${total} (${pct}%)`

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgba(0,0,0,0.85)'
  ctx.fillRect(0, 0, 512, 128)
  ctx.fillStyle = '#818cf8'
  ctx.font = '20px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(label, 256, 45)

  // Progress bar
  if (phase === 'rendering' && total > 0) {
    const barW = 400
    const barH = 8
    const barX = (512 - barW) / 2
    const barY = 70
    ctx.fillStyle = '#374151'
    ctx.fillRect(barX, barY, barW, barH)
    ctx.fillStyle = '#818cf8'
    ctx.fillRect(barX, barY, barW * (current / total), barH)
  }

  const texture = new THREE.CanvasTexture(canvas)
  return (
    <mesh position={[0, 0.5, 0]}>
      <planeGeometry args={[5, 1.25]} />
      <meshBasicMaterial map={texture} transparent depthTest={false} />
    </mesh>
  )
}
