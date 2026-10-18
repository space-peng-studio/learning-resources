type SparkleProps = {
  className?: string;
  style?: React.CSSProperties;
};

// 四角星裝飾
export default function Sparkle({ className, style }: SparkleProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M12 0C12.6 7 17 11.4 24 12C17 12.6 12.6 17 12 24C11.4 17 7 12.6 0 12C7 11.4 11.4 7 12 0Z" />
    </svg>
  );
}
