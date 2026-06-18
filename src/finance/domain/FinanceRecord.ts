// Bounded Context: Finance
// Aggregate Root: ФинансијскиЗапис (видети Context/domain-model.md)

import type { Amount } from "@finance/domain/Amount";
import type { RecordType } from "@finance/domain/Category";

export interface FinanceRecord {
  readonly id: string;
  readonly type: RecordType;
  readonly amount: Amount;
  readonly dateTime: Date;
  readonly categoryId: string; // ref на Entity Категорија
  readonly counterparty: string;
  readonly description?: string;
  readonly authorId: string; // Firebase UID Администратора
  readonly createdAt: Date; // audit trail, аутоматски при креирању
}
