export type PadKey = number | 'back' | 'enter';

const ROWS: PadKey[][] = [
  [7, 8, 9],
  [4, 5, 6],
  [1, 2, 3],
  ['back', 0, 'enter'],
];

/** Big on-screen number pad. Fires on pointer-down so taps feel instant on a tablet. */
export function NumberPad({
  onKey,
  disabled,
}: {
  onKey: (key: PadKey) => void;
  disabled?: boolean;
}) {
  return (
    <div className="pad" aria-label="Number pad">
      {ROWS.flat().map((key) => (
        <button
          key={String(key)}
          type="button"
          className={`pad__key pad__key--${typeof key === 'number' ? 'digit' : key}`}
          disabled={disabled}
          aria-label={key === 'back' ? 'Delete' : key === 'enter' ? 'Enter' : String(key)}
          onPointerDown={(e) => {
            e.preventDefault();
            if (!disabled) onKey(key);
          }}
        >
          {key === 'back' ? '⌫' : key === 'enter' ? '✓' : key}
        </button>
      ))}
    </div>
  );
}
