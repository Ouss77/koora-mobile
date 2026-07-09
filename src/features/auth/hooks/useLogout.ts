import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}