// Application: хук за real-time листу категорија.
// Претплата живи колико и компонента; Firestore детаљи остају у repository-ју.

import { useEffect, useState } from "react";
import { subscribe } from "@finance/infrastructure/CategoryRepository";
import type { Category } from "@finance/domain/Category";

export function useCategoryList(): Category[] {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe(setCategories);
    return unsubscribe;
  }, []);

  return categories;
}
