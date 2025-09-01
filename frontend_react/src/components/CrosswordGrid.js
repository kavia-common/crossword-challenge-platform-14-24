import React from 'react';

/**
 * Basic crossword grid component.
 * Expects: grid: 2D array of strings or nulls. '#' for blocks, '' or letters for cells.
 * onChange(row, col, letter) to update cell input.
 */

// PUBLIC_INTERFACE
export default function CrosswordGrid({ grid, onChange }) {
  if (!grid || !Array.isArray(grid) || grid.length === 0) {
    return <div>No grid available.</div>;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${grid[0].length}, 32px)`,
      gap: 2,
      background: '#ddd',
      padding: 4,
      borderRadius: 6,
      width: 'fit-content'
    }}>
      {grid.map((row, rIdx) => row.map((cell, cIdx) => {
        const isBlock = cell === '#' || cell === null;
        return (
          <div key={`${rIdx}-${cIdx}`} style={{
            width: 32, height: 32, background: isBlock ? '#1a1a1a' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 2, border: '1px solid #eee'
          }}>
            {isBlock ? null : (
              <input
                aria-label={`cell-${rIdx}-${cIdx}`}
                value={typeof cell === 'string' ? cell : ''}
                onChange={(e) => {
                  const v = e.target.value.slice(-1).toUpperCase().replace(/[^A-Z]/g, '');
                  onChange(rIdx, cIdx, v);
                }}
                style={{
                  width: '100%', height: '100%', border: 'none', outline: 'none',
                  textAlign: 'center', textTransform: 'uppercase', fontWeight: 700
                }}
                maxLength={1}
              />
            )}
          </div>
        );
      }))}
    </div>
  );
}
