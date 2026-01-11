interface Props {
  title: string;
  value: number | string;
  variant?: 'default' | 'highlight';
}

export default function StatCard({ title, value, variant = 'default' }: Props) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-card-info">
        <h4 className="stat-card-title">{title}</h4>
        <span className="stat-card-value">{value}</span>
      </div>
    </div>
  );
}