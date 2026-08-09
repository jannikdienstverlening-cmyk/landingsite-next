export function shouldApplyStripeEvent(lastAppliedCreated: number | null | undefined, incomingCreated: number) {
  return !lastAppliedCreated || incomingCreated >= lastAppliedCreated
}
