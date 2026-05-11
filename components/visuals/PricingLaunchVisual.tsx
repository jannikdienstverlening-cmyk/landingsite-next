export function PricingLaunchVisual() {
  return (
    <figure
      className="pricing-launch-visual"
      role="img"
      aria-label="Drie launch-routes voor Starter, Pro en Premium pakketten"
    >
      <div className="pricing-route route-starter">
        <span>Starter</span>
        <strong>Compact</strong>
        <i />
      </div>
      <div className="pricing-route route-pro">
        <span>Pro</span>
        <strong>Campagne</strong>
        <i />
      </div>
      <div className="pricing-route route-premium">
        <span>Premium</span>
        <strong>Studio</strong>
        <i />
      </div>
      <div className="pricing-orbit" aria-hidden="true" />
    </figure>
  )
}
