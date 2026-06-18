// Bounded Context: Finance
// Entity: Категорија (видети Context/domain-model.md, ADR-010)

export type RecordType = "Приход" | "Расход";

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly type: RecordType; // категорије нису дељене међу типовима
  readonly active: boolean; // меко брисање
  readonly system: boolean; // true само за "Непознато"; назив/активност нису изменљиви
}
