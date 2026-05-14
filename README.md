# ModelViz

> 🎲 **Drag & drop 3D model viewer** — inspect meshes in your browser, zero setup.

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

Load, rotate, and inspect 3D models instantly — just drag a file into the browser. Built with React Three Fiber.

## Features

- **Drag & drop** — drop `.glb`, `.gltf`, `.obj`, `.stl`, `.fbx`, `.ply`, `.stp`, `.iges`, `.dae`, `.3ds`, `.amf`, `.vtk` files
- **Orbit controls** — rotate, pan, zoom with mouse/touch
- **Auto-center & scale** — models fit the viewport automatically
- **Auto-rotate** — toggle automatic rotation for inspection
- **Wireframe mode** — visualize mesh topology
- **Grid overlay** — toggleable ground plane with shadow
- **Screenshot** — one-click PNG capture of the viewport
- **Model info** — file name, format, size, vertex/face count
- **Dark theme** — easy on the eyes

## Quick Start

```bash
# Clone
git clone https://github.com/goodisok/ModelViz.git
cd ModelViz

# Install
npm install

# Dev
npm run dev

# Build
npm run build
```

Open `http://localhost:5173` and drag a 3D model in.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 |
| 3D Engine | Three.js + React Three Fiber |
| Helpers | @react-three/drei |
| Styling | Tailwind CSS |
| Bundler | Vite |

## Supported Formats

| Format | Extension | Engine | Notes |
|--------|-----------|--------|-------|
| glTF Binary | `.glb` | Three.js GLTFLoader | Recommended |
| glTF | `.gltf` | Three.js GLTFLoader | |
| Wavefront OBJ | `.obj` | Three.js OBJLoader | No MTL support |
| STL | `.stl` | Three.js STLLoader | |
| FBX | `.fbx` | Three.js FBXLoader | |
| PLY | `.ply` | Three.js PLYLoader | |
| **STEP** | `.stp` `.step` | occt-import-js WASM | CAD assemblies, B-Rep → mesh |
| **IGES** | `.iges` `.igs` | occt-import-js WASM | Legacy CAD interchange |
| **Collada** | `.dae` | Three.js ColladaLoader | Architecture / BIM |
| **3D Studio** | `.3ds` | Three.js TDSLoader | Legacy 3ds Max |
| **AMF** | `.amf` | Three.js AMFLoader | Additive manufacturing |
| **VTK** | `.vtk` | Three.js VTKLoader | Scientific visualization |

## License

MIT
