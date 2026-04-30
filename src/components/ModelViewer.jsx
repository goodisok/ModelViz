import { useEffect, useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'
import * as THREE from 'three'

const LOADER_MAP = {
  glb: GLTFLoader,
  gltf: GLTFLoader,
  obj: OBJLoader,
  stl: STLLoader,
  fbx: FBXLoader,
  ply: PLYLoader,
}

function countMeshData(obj) {
  let vertices = 0
  let faces = 0
  obj.traverse((child) => {
    if (child.isMesh || child.isSkinnedMesh) {
      const geo = child.geometry
      if (geo.index) {
        vertices += geo.index.count
        faces += geo.index.count / 3
      } else if (geo.attributes.position) {
        const c = geo.attributes.position.count
        vertices += c
        faces += c / 3
      }
    }
  })
  return { vertices: Math.round(vertices), faces: Math.round(faces) }
}

function toggleWireframe(root, enabled) {
  root.traverse((child) => {
    if (child.isMesh) {
      if (!child.userData.origMaterial) {
        child.userData.origMaterial = child.material.clone()
      }
      if (enabled) {
        child.material = child.material.clone()
        child.material.wireframe = true
        child.material.color.set('#a78bfa')
      } else {
        child.material = child.userData.origMaterial.clone()
      }
      child.material.needsUpdate = true
    }
  })
}

export default function ModelViewer({ url, ext, wireframe, onLoad }) {
  const groupRef = useRef()
  const loadedRef = useRef(false)

  const LoaderClass = LOADER_MAP[ext]
  const result = useLoader(LoaderClass, url)

  // Extract stats from the loader result directly
  useEffect(() => {
    if (!result || loadedRef.current) return
    const root = result.scene || result
    if (!root) return

    // Count stats directly from the loaded result
    const stats = countMeshData(root)

    // Clone and add to group (deferred to next tick to ensure ref is set)
    requestAnimationFrame(() => {
      const group = groupRef.current
      if (!group) return

      const clone = root.clone ? root.clone(true) : root
      group.add(clone)

      // Auto-center & scale
      const box = new THREE.Box3().setFromObject(clone)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = maxDim > 0 ? 2 / maxDim : 1
      clone.position.sub(center)
      clone.scale.setScalar(scale)

      // Report stats
      onLoad?.(stats)
      loadedRef.current = true
    })
  }, [result, onLoad])

  // Wireframe toggle
  useEffect(() => {
    if (!groupRef.current || !loadedRef.current) return
    toggleWireframe(groupRef.current, wireframe)
  }, [wireframe])

  return <group ref={groupRef} />
}
