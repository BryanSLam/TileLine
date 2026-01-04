import { useDrag } from 'react-dnd';
import { Tile as TileType } from '../../types';
import { Tile } from './Tile';

interface DraggableTileProps {
  tile: TileType;
  size?: number;
  disabled?: boolean;
}

interface DragItem {
  type: string;
  tile: TileType;
}

export function DraggableTile({ tile, size = 60, disabled = false }: DraggableTileProps) {
  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: 'TILE',
    item: { type: 'TILE', tile },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} style={{ cursor: disabled ? 'default' : 'grab' }}>
      <Tile tile={tile} size={size} isDragging={isDragging} />
    </div>
  );
}
