import './market-storm.css';

/**
 * Market Storm's section layout. It adds no markup — it exists so the
 * section's stylesheet (the storm sky, the hero and band, the report
 * furniture; every class `ms-` prefixed) loads once for the index and
 * every report.
 */
export default function MarketStormLayout({ children }: { children: React.ReactNode }) {
  return children;
}
