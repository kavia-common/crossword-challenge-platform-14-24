import React from "react";

/**
 * Basic crossword grid that supports block cells (#) and letter inputs.
 * Expects a 2D array of characters; '#' denotes a block.
 *
 * PUBLIC_INTERFACE
 */
export default function CrosswordGrid({ grid, values, onChange }) {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 34px)` }} role="grid" aria-rowcount={rows} aria-colcount={cols}>
      {grid.map((row, rIdx) =>
        row.map((cell, cIdx) => {
          const key = `${rIdx}-${cIdx}`;
          const isBlock = cell === "#" || cell === null;
          const v = values[key] || "";
          return (
            <div className={`cell ${isBlock ? "block" : ""}`} key={key} role="gridcell" aria-label={`r${rIdx+1} c${cIdx+1}`}>
              {!isBlock && (
                <input
                  value={v}
                  maxLength={1}
                  onChange={(e) => onChange(key, e.target.value.toUpperCase().slice(0,1))}
                  aria-label={`Cell ${rIdx+1},${cIdx+1}`}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
