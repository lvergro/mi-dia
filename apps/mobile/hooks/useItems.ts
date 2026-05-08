import { useQuery } from "@tanstack/react-query";
import { getItems } from "@mi-dia/database";

export function useItems() {
  return useQuery({
    queryKey: ["items"],
    queryFn: () => getItems(),
  });
}
