import { useQuery } from "@tanstack/react-query";
import { getMedications } from "@mi-dia/database";
import { useSessionStore } from "./useSession";

export function useMedications() {
  const userId = useSessionStore((s) => s.session?.user.id);

  return useQuery({
    queryKey: ["medications", userId],
    queryFn: () => getMedications(userId!),
    enabled: !!userId,
  });
}
