import { Tile as TileType } from '../../types';
import { TileShape } from './TileShape';
import styles from './Tile.module.css';
import clsx from 'clsx';

interface TileProps {
  tile: TileType;
  size?: number;
  isDragging?: boolean;
  isPlaced?: boolean;
}

export function Tile({ tile, size, isDragging = false, isPlaced = false }: TileProps) {
  const colorValue = `var(--color-${tile.color})`;

  // Use CSS variable for size if not specified (responsive)
  const style = size ? { width: size, height: size } : {};

  return (
    <div
      className={clsx(styles.tile, {
        [styles.dragging]: isDragging,
        [styles.placed]: isPlaced
      })}
      style={style}
      aria-label={`${tile.color} ${tile.shape}`}
    >
      <TileShape shape={tile.shape} color={colorValue} size={size ? size * 0.7 : undefined} />
    </div>
  );
}
