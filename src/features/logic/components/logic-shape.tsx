import { shapeColors, type ShapeSize, type ShapeToken } from "@/features/logic/data/games";

const sizePixels: Record<ShapeSize, number> = {
  small: 38,
  medium: 58,
  large: 78,
  xlarge: 98,
};

type Props = {
  token: ShapeToken;
  size?: number;
  className?: string;
  label?: string;
};

export function LogicShape({ token, size, className = "", label }: Props) {
  const dimension = size ?? sizePixels[token.size];
  const fill = shapeColors[token.color];
  const common = {
    fill,
    stroke: "#0000001f",
    strokeWidth: 2,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  return (
    <svg
      className={`logic-shape ${className}`.trim()}
      width={dimension}
      height={dimension}
      viewBox="0 0 100 100"
      role="img"
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      focusable={false}
    >
      {token.kind === "circle" && <circle cx="50" cy="50" r="43" {...common} />}
      {token.kind === "square" && <rect x="9" y="9" width="82" height="82" rx="13" {...common} />}
      {token.kind === "triangle" && <polygon points="50,7 95,89 5,89" {...common} />}
      {token.kind === "star" && (
        <polygon points="50,4 61.2,37.8 96.8,38.2 68.5,59 79.4,93 50,72.2 20.6,93 31.5,59 3.2,38.2 38.8,37.8" {...common} />
      )}
      {token.kind === "diamond" && <polygon points="50,4 95,50 50,96 5,50" {...common} />}
      {token.kind === "heart" && (
        <path
          d="M50 91 C19 68 7 48 7 31 C7 15 20 7 32 7 C41 7 47 12 50 19 C53 12 59 7 68 7 C80 7 93 15 93 31 C93 48 81 68 50 91 Z"
          {...common}
        />
      )}
    </svg>
  );
}
