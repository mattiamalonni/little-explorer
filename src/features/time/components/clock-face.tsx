type ClockFaceProps = {
  hour: number;
  minute: number;
  size?: number;
  className?: string;
  label?: string;
  decorative?: boolean;
};

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);

function pointAt(angle: number, radius: number): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;
  return {
    x: 50 + radius * Math.sin(radians),
    y: 50 - radius * Math.cos(radians),
  };
}

export function ClockFace({ hour, minute, size = 200, className = "", label, decorative = false }: ClockFaceProps) {
  const safeHour = ((Math.floor(hour) - 1 + 12) % 12) + 1;
  const safeMinute = Math.min(59, Math.max(0, Math.floor(minute)));
  const minuteAngle = safeMinute * 6;
  const hourAngle = (safeHour % 12) * 30 + safeMinute * 0.5;
  const accessibleLabel = label ?? `Orologio che segna le ${safeHour} e ${safeMinute} minuti`;

  return (
    <svg
      className={`clock-face ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      {...(decorative ? { "aria-hidden": true, focusable: false } : { role: "img", "aria-label": accessibleLabel })}
    >
      <circle className="clock-rim" cx="50" cy="50" r="47" />
      <circle className="clock-inner" cx="50" cy="50" r="42.5" />

      {Array.from({ length: 60 }, (_, index) => {
        const angle = index * 6;
        const major = index % 5 === 0;
        const outer = pointAt(angle, 40.5);
        const inner = pointAt(angle, major ? 36 : 38.5);
        return (
          <line
            key={index}
            className={major ? "clock-tick clock-tick-major" : "clock-tick"}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
          />
        );
      })}

      {HOURS.map((value) => {
        const position = pointAt(value * 30, 30);
        return (
          <text key={value} className="clock-number" x={position.x} y={position.y} textAnchor="middle" dominantBaseline="central">
            {value}
          </text>
        );
      })}

      <line className="clock-hand clock-hand-hour" x1="50" y1="50" x2="50" y2="28.5" transform={`rotate(${hourAngle} 50 50)`} />
      <line
        className="clock-hand clock-hand-minute"
        x1="50"
        y1="50"
        x2="50"
        y2="18.5"
        transform={`rotate(${minuteAngle} 50 50)`}
      />
      <circle className="clock-center" cx="50" cy="50" r="4" />
      <circle className="clock-center-pin" cx="50" cy="50" r="1.5" />
    </svg>
  );
}
