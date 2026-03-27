import { useState } from 'react'

const mapLayout = [
  ['E','_','1A','_','2A'],
  ['_','_','1B','_','2B'],
  ['_','_','_','_','_'],
  ['3A','_','4A','_','5A'],
  ['3B','_','4B','_','5B'],
]

const aisleLabels: Record<string, string> = {
  '1A': '🌾', '1B': '🫘', '2A': '🫒', '2B': '🥛',
  '3A': '🍞', '3B': '🍵', '4A': '🍪', '4B': '🧂',
  '5A': '🧴', '5B': '🪥', 'E': '🚪',
}

export default function StoreMapPage() {
  const [highlight, setHighlight] = useState<string | null>(null)

  const products = [
    { name: 'Rice', cell: '1A' },
    { name: 'Dal', cell: '1B' },
    { name: 'Oil', cell: '2A' },
    { name: 'Milk', cell: '2B' },
    { name: 'Bread', cell: '3A' },
    { name: 'Tea', cell: '3B' },
    { name: 'Snacks', cell: '4A' },
    { name: 'Salt / Sugar', cell: '4B' },
    { name: 'Soap', cell: '5A' },
    { name: 'Toothpaste', cell: '5B' },
  ]

  return (
    <div className="anim-slide">
      <div className="section-header">
        <span className="section-emoji">🗺️</span>
        <h2>Find in Store</h2>
      </div>

      {/* Product quick find */}
      <div className="chip-scroll mb-2">
        {products.map(p => (
          <button key={p.cell} className={`chip ${highlight === p.cell ? 'active' : ''}`}
            onClick={() => setHighlight(p.cell)}>
            <span className="chip-icon">{aisleLabels[p.cell]}</span>
            <span className="chip-label">{p.name}</span>
          </button>
        ))}
      </div>

      {/* Store map grid */}
      <div className="store-map">
        <div className="map-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {mapLayout.flat().map((cell, i) => {
            const isEntry = cell === 'E'
            const isAisle = cell !== '_' && cell !== 'E'
            const isHighlighted = cell === highlight
            return (
              <div key={i} className={`map-cell ${isEntry ? 'entry' : isAisle ? 'aisle' : ''} ${isHighlighted ? 'highlight' : ''}`}
                onClick={() => isAisle && setHighlight(cell)}>
                {cell !== '_' ? (aisleLabels[cell] || cell) : ''}
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.75rem', fontSize: 'var(--text-xs)' }}>
          <span>🚪 = Entry</span>
          <span className="text-blue">■ = Aisle</span>
          <span className="text-green">■ = Your Item</span>
        </div>
      </div>

      {highlight && (
        <div className="alert alert-success mt-2">
          <span className="alert-icon">{aisleLabels[highlight]}</span>
          <span className="alert-text">
            Go to <strong>Aisle {highlight[0]}, Shelf {highlight[1]}</strong>
          </span>
        </div>
      )}
    </div>
  )
}
