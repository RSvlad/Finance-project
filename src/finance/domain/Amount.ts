// Bounded Context: Finance
// Value Object: Износ (видети Context/domain-model.md, ADR-009)

export interface Amount {
  readonly value: number;
  readonly currency: string; // ISO 4217, нпр. "RSD", "EUR", "USD"
}
