import Card from "./Card.jsx";
import Badge from "./Badge.jsx";

export default function StatCard({ label, value, detail, icon: Icon, trend, trendVariant = "completed", className = "", children }) {
  return (
    <Card className={`rio-stat-card ${className}`.trim()}>
      <div className="rio-stat-card__top">
        <p className="rio-stat-card__label">{label}</p>
        {Icon ? <span className="rio-stat-card__icon"><Icon size={18} aria-hidden="true" /></span> : null}
      </div>
      <div className="rio-stat-card__value-row"><p className="rio-stat-card__value">{value}</p>{trend ? <Badge variant={trendVariant}>{trend}</Badge> : null}</div>
      {detail ? <p className="rio-stat-card__detail">{detail}</p> : null}
      {children ? <div className="rio-stat-card__footer">{children}</div> : null}
    </Card>
  );
}
