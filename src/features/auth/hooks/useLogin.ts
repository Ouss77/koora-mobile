    import { useMutation, useQueryClient } from "@tanstack/react-query";
    import { authService } from "../services/authService";
    import { LoginFormData } from "../schemas/loginSchema";

    export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: LoginFormData) => authService.login(formData),
        onSuccess: () => {
        // Invalide ['session'] pour forcer un rechargement avec le nouvel état connecté
        queryClient.invalidateQueries({ queryKey: ["session"] });
        },
    });
    }