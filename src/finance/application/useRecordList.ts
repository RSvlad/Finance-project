// Application: хук за real-time листу финансијских записа.

import { useEffect, useState } from "react";
import { subscribe } from "@finance/infrastructure/FinanceRecordRepository";
import type { FinanceRecord } from "@finance/domain/FinanceRecord";

export function useRecordList(): FinanceRecord[] {
  const [records, setRecords] = useState<FinanceRecord[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe(setRecords);
    return unsubscribe;
  }, []);

  return records;
}
