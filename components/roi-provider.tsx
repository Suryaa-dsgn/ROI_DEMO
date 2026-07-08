"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  PRODUCTS,
  defaultValues,
  getProduct,
  productsForSegment,
  type Product,
} from "@/lib/roi-config";
import {
  aggregate,
  type ProductResult,
  type Segment,
  type Totals,
} from "@/lib/roi-engine";

export type View = "landing" | "calculator" | "method" | "sources";

interface RoiContextValue {
  view: View;
  setView: (v: View) => void;

  segment: Segment;
  chooseSegment: (s: Segment) => void;
  resetSegment: () => void;

  activeProductId: string | null;
  setActiveProductId: (id: string) => void;
  activeProduct: Product | null;

  values: Record<string, Record<string, number>>;
  setValue: (productId: string, fieldKey: string, value: number) => void;

  activeProducts: Product[];
  results: ProductResult[];
  totals: Totals;

  /** Lines + totals for a single product (the focused one). */
  productLines: (productId: string) => ProductResult["lines"];
  productHardDollar: (productId: string) => number;
}

const RoiContext = createContext<RoiContextValue | null>(null);

export function RoiProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<View>("landing");
  const segment: Segment = "provider";
  const [activeProductId, setActiveProductId] = useState<string | null>(() => {
    const first = productsForSegment("provider")[0];
    return first ? first.id : null;
  });
  const [values, setValues] = useState(defaultValues);

  const setValue = useCallback(
    (productId: string, fieldKey: string, value: number) => {
      setValues((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], [fieldKey]: value },
      }));
    },
    [],
  );

  // No-op: segment is hardcoded to "provider".
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const chooseSegment = useCallback((_s: Segment) => {}, []);

  // Go back to landing when the user exits the calculator.
  const resetSegment = useCallback(() => {
    setView("landing");
  }, [setView]);

  const activeProducts = useMemo(
    () => productsForSegment(segment),
    [segment],
  );

  const results = useMemo<ProductResult[]>(
    () =>
      activeProducts.map((p) => ({
        productId: p.id,
        lines: p.compute(values[p.id]),
      })),
    [activeProducts, values],
  );

  const totals = useMemo(() => aggregate(results), [results]);

  const activeProduct = useMemo(
    () => (activeProductId ? getProduct(activeProductId) ?? null : null),
    [activeProductId],
  );

  const productLines = useCallback(
    (productId: string) => {
      const found = results.find((r) => r.productId === productId);
      if (found) return found.lines;
      const p = getProduct(productId);
      return p ? p.compute(values[productId]) : [];
    },
    [results, values],
  );

  const productHardDollar = useCallback(
    (productId: string) =>
      productLines(productId)
        .filter((l) =>
          ["moneySaved", "timeSaved", "moneyRecovered"].includes(l.category),
        )
        .reduce((s, l) => s + l.amount, 0),
    [productLines],
  );

  const value: RoiContextValue = {
    view,
    setView,
    segment,
    chooseSegment,
    resetSegment,
    activeProductId,
    setActiveProductId,
    activeProduct,
    values,
    setValue,
    activeProducts,
    results,
    totals,
    productLines,
    productHardDollar,
  };

  return <RoiContext.Provider value={value}>{children}</RoiContext.Provider>;
}

export function useRoi(): RoiContextValue {
  const ctx = useContext(RoiContext);
  if (!ctx) throw new Error("useRoi must be used within RoiProvider");
  return ctx;
}

export const ALL_PRODUCTS = PRODUCTS;
