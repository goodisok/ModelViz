import { useState } from 'react'

function ToolButton({ icon, label, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-2 rounded-lg transition-all text-sm ${
        active
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className="text-lg leading-none">{icon}</span>
    </button>
  )
}

export default function Toolbar({
  autoRotate, onToggleAutoRotate,
  wireframe, onToggleWireframe,
  gridVisible, onToggleGrid,
  onScreenshot, onReset, hasModel,
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {/* Left — Logo */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <span className="text-xl select-none">🎲</span>
        <span className="font-bold text-sm tracking-tight text-zinc-100">ModelViz</span>
      </div>

      {/* Right — Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 bg-zinc-800/80 backdrop-blur-sm rounded-xl border border-zinc-700/50">
        <ToolButton icon="⟳" label="Auto Rotate" active={autoRotate} onClick={onToggleAutoRotate} />
        <ToolButton icon="◇" label="Wireframe" active={wireframe} onClick={onToggleWireframe} disabled={!hasModel} />
        <ToolButton icon="⊞" label="Grid" active={gridVisible} onClick={onToggleGrid} />

        <div className="w-px h-6 bg-zinc-700 mx-0.5" />

        <ToolButton icon="📷" label="Screenshot" onClick={onScreenshot} disabled={!hasModel} />
        <ToolButton icon="✕" label="Close Model" onClick={onReset} disabled={!hasModel} />

        <div className="w-px h-6 bg-zinc-700 mx-0.5" />

        <a
          href="https://github.com/goodisok/ModelViz"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
          className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-all"
        >
          <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
      </div>
    </>
  )
}
