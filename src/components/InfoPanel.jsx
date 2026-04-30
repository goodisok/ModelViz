function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatNumber(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

export default function InfoPanel({ info }) {
  if (!info) return null

  return (
    <div className="absolute bottom-4 left-4 z-20 p-3 bg-zinc-800/80 backdrop-blur-sm rounded-xl border border-zinc-700/50 text-xs min-w-[180px]">
      <div className="font-medium text-zinc-200 truncate max-w-[200px]" title={info.name}>
        {info.name}
      </div>

      <div className="mt-2 space-y-1 text-zinc-400">
        <div className="flex justify-between gap-4">
          <span>Format</span>
          <span className="text-zinc-300 font-mono">{info.format}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Size</span>
          <span className="text-zinc-300">{formatSize(info.size)}</span>
        </div>
        {info.vertices !== undefined && (
          <>
            <div className="flex justify-between gap-4">
              <span>Vertices</span>
              <span className="text-zinc-300">{formatNumber(info.vertices)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Faces</span>
              <span className="text-zinc-300">{formatNumber(info.faces)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
