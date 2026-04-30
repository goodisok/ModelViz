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

function centerAndScale(group) {
  const box = new THREE.Box3().setFromObject(group)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = maxDim > 0 ? 2 / maxDim : 1
  group.position.copy(center.clone().negate())
  group.scale.setScalar(scale)
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
  const wireframeRef = useRef(wireframe)
  const loadedRef = useRef(false)
  const sceneRef = useRef(null)

  const LoaderClass = LOADER_MAP[ext]
  const result = useLoader(LoaderClass, url)

  useEffect(() => {
    if (!result || loadedRef.current) return
    const group = groupRef.current
    if (!group) return

    // Extract scene/group from loader result
    const root = result.scene ? result.scene.clone(true) : result.clone ? result.clone(true) : result
    group.add(root)
    sceneRef.current = root

    // Auto-center & scale
    centerAndScale(group)

    // Report stats
    const stats = countMeshData(group)
    onLoad?.(stats)

    loadedRef.current = true
  }, [result, onLoad])

  // Wireframe toggle
  useEffect(() => {
    if (!sceneRef.current) return
    if (wireframeRef.current !== wireframe) {
      toggleWireframe(sceneRef.current, wireframe)
      wireframeRef.current = wireframe
    }
  }, [wireframe])

  return <group ref={groupRef} />
}
