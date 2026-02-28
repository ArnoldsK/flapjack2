import { useEffect } from "react";

const BRAND = "Pepsi Dog";

export const useDocumentTitle = (title: string | null): void => {
  useEffect(() => {
    document.title = title ? `${title} · ${BRAND}` : BRAND;
  }, [title]);
};
