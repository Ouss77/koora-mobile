import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { RegisterFormData } from "../schemas/registerSchema";

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: RegisterFormData) => authService.register(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}