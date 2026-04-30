import { useRef, useState, useCallback } from 'react'

export default function DropZone({ onFile }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleClick = () => inputRef.current?.click()
  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) onFile(file)
  }

  const handleDragEnter = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setDragging(false) }

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={(e) => { e.preventDefault(); setDragging(false) }}
      className={`absolute inset-0 z-30 flex flex-col items-center justify-center cursor-pointer transition-colors ${
        dragging ? 'bg-zinc-800/90' : 'bg-zinc-900/80'
      }`}
    >
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="text-6xl select-none">🎲</div>

        <h1 className="text-3xl font-bold tracking-tight">ModelViz</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Drag & drop a 3D model file here, or click to browse
        </p>

        <div className="flex flex-wrap justify-center gap-2 text-xs mt-2">
          {['GLB', 'GLTF', 'OBJ', 'STL', 'FBX', 'PLY'].map((fmt) => (
            <span key={fmt} className="px-2.5 py-1 rounded-full bg-zinc-700 text-zinc-300 font-mono">
              .{fmt.toLowerCase()}
            </span>
          ))}
        </div>

        <span className="inline-block mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors cursor-pointer">
          Browse Files
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".glb,.gltf,.obj,.stl,.fbx,.ply,.3dm"
        className="hidden"
        onChange={handleChange}
      />

      <div className="absolute bottom-6 text-center text-zinc-600 text-xs">
        <a
          href="https://github.com/goodisok/ModelViz"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-400 transition-colors"
        >
          GitHub &middot; Open Source
        </a>
      </div>
    </div>
  )
}
