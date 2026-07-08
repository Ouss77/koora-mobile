import { authRepository } from "../repositories/authRepository";
import { registerSchema, RegisterFormData } from "../schemas/registerSchema";
import { loginSchema, LoginFormData } from "../schemas/loginSchema";

// Erreur métier propre au domaine Auth — permet à l'UI de distinguer
// une erreur "attendue" (pseudo déjà pris) d'une erreur technique inattendue
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export const authService = {
  async register(formData: RegisterFormData) {
    // Revalidation défensive : même si l'UI a déjà validé via Zod,
    // le Service ne fait jamais confiance aveuglément à son appelant
    const parsed = registerSchema.safeParse(formData);
    if (!parsed.success) {
      throw new AuthError("Les données saisies sont invalides.");
    }

    try {
      const { username, email, password } = parsed.data;
      return await authRepository.signUp(username, email, password);
    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }
      // Traduction des erreurs techniques Supabase en messages métier clairs
      if (error?.code === "23505" || error?.message?.includes("duplicate")) {
        throw new AuthError("Ce pseudo ou cet email est déjà utilisé.");
      }
      if (error?.message?.includes("Password")) {
        throw new AuthError("Le mot de passe ne respecte pas les critères de sécurité.");
      }
      if (error?.message?.includes("closed or destroyed stream")) {
        throw new AuthError(
          "La connexion au serveur a été interrompue pendant l'inscription. Réessaie."
        );
      }
      throw new AuthError("Une erreur est survenue lors de l'inscription. Réessaie plus tard.");
    }
  },

  async login(formData: LoginFormData) {
    const parsed = loginSchema.safeParse(formData);
    if (!parsed.success) {
      throw new AuthError("Pseudo ou mot de passe invalide.");
    }

    try {
      const { username, password } = parsed.data;
      return await authRepository.signIn(username, password);
    } catch (error: any) {
      // Message volontairement générique : ne pas révéler si c'est le
      // pseudo ou le mot de passe qui est incorrect (bonne pratique sécurité)
      throw new AuthError("Pseudo ou mot de passe incorrect.");
    }
  },

  async logout() {
    try {
      await authRepository.signOut();
    } catch (error) {
      throw new AuthError("Erreur lors de la déconnexion.");
    }
  },

  async getCurrentSession() {
    try {
      return await authRepository.getSession();
    } catch (error) {
      throw new AuthError("Impossible de récupérer la session.");
    }
  },
};