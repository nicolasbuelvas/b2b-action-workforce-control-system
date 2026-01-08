interface Props {
  title: string;
  value: number | string;
}

export default function StatCard({ title, value }: Props) {
  return (
    <div className="stat-card">
      <div className="stat-card-info">
        <h4>{title}</h4>
        <span className="value">{value}</span>
      </div>
    </div>
  );
}