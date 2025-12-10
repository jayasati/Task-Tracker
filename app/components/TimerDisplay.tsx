type TimerDisplayProps = {
  seconds: number;
};

export default function TimerDisplay({ seconds }: TimerDisplayProps) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");

  return (
    <span style={{ fontSize: 22, fontWeight: "bold" }}>
      {`${h}:${m}:${s}`}
    </span>
  );
}
