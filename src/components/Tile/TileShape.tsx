import { TileShape as TileShapeEnum } from '../../types';

interface TileShapeProps {
  shape: TileShapeEnum;
  color: string;
  size?: number;
}

export function TileShape({ shape, color, size }: TileShapeProps) {
  // Default to 40 if not specified, or use "1em" for responsive sizing
  const actualSize = size || 40;
  const center = actualSize / 2;
  const radius = actualSize * 0.35;

  switch (shape) {
    case TileShapeEnum.CIRCLE:
      return (
        <svg width={actualSize} height={actualSize} viewBox={`0 0 ${actualSize} ${actualSize}`}>
          <circle cx={center} cy={center} r={radius} fill={color} />
        </svg>
      );

    case TileShapeEnum.SQUARE:
      return (
        <svg width={actualSize} height={actualSize} viewBox={`0 0 ${actualSize} ${actualSize}`}>
          <rect
            x={center - radius}
            y={center - radius}
            width={radius * 2}
            height={radius * 2}
            fill={color}
          />
        </svg>
      );

    case TileShapeEnum.DIAMOND:
      return (
        <svg width={actualSize} height={actualSize} viewBox={`0 0 ${actualSize} ${actualSize}`}>
          <polygon
            points={`${center},${center - radius} ${center + radius},${center} ${center},${center + radius} ${center - radius},${center}`}
            fill={color}
          />
        </svg>
      );

    case TileShapeEnum.STAR:
      return (
        <svg width={actualSize} height={actualSize} viewBox={`0 0 ${actualSize} ${actualSize}`}>
          <path
            d={createStarPath(center, center, 5, radius, radius * 0.5)}
            fill={color}
          />
        </svg>
      );

    case TileShapeEnum.CROSS:
      const armWidth = radius * 0.5;
      return (
        <svg width={actualSize} height={actualSize} viewBox={`0 0 ${actualSize} ${actualSize}`}>
          <path
            d={`
              M ${center - armWidth} ${center - radius}
              L ${center + armWidth} ${center - radius}
              L ${center + armWidth} ${center - armWidth}
              L ${center + radius} ${center - armWidth}
              L ${center + radius} ${center + armWidth}
              L ${center + armWidth} ${center + armWidth}
              L ${center + armWidth} ${center + radius}
              L ${center - armWidth} ${center + radius}
              L ${center - armWidth} ${center + armWidth}
              L ${center - radius} ${center + armWidth}
              L ${center - radius} ${center - armWidth}
              L ${center - armWidth} ${center - armWidth}
              Z
            `}
            fill={color}
          />
        </svg>
      );

    case TileShapeEnum.CLOVER:
      const leafRadius = radius * 0.45;
      return (
        <svg width={actualSize} height={actualSize} viewBox={`0 0 ${actualSize} ${actualSize}`}>
          <circle cx={center} cy={center - leafRadius} r={leafRadius} fill={color} />
          <circle cx={center + leafRadius} cy={center} r={leafRadius} fill={color} />
          <circle cx={center} cy={center + leafRadius} r={leafRadius} fill={color} />
          <circle cx={center - leafRadius} cy={center} r={leafRadius} fill={color} />
          <circle cx={center} cy={center} r={leafRadius * 0.7} fill={color} />
        </svg>
      );

    default:
      return null;
  }
}

/**
 * Helper function to create a star path
 */
function createStarPath(
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
): string {
  let path = '';
  const step = Math.PI / spikes;

  for (let i = 0; i < 2 * spikes; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }

  return path + ' Z';
}
