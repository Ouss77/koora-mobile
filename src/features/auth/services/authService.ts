import { authRepository } from "../repositories/authRepository";
import { registerSchema, RegisterFormData } from "../schemas/registerSchema";
import { loginSchema, LoginFormData } from "../schemas/loginSchema";

type SupabaseAuthError = {
  code?: string;
  message: string;
  name?: string;
};

function isSupabaseAuthError(error: unknown): error is SupabaseAuthError {
  return typeof error === "object" && error !== null && "message" in error;
}

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
  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    throw new AuthError("Les données saisies sont invalides.");
  }

  try {
    const { username, email, password } = parsed.data;
    return await authRepository.signUp(username, email, password);
  } catch (error: unknown) {
    if (!isSupabaseAuthError(error)) {
      throw new AuthError("Une erreur inattendue est survenue.");
    }

    if (error.message === "Network request failed" || error.name === "TypeError") {
      throw new AuthError("Impossible de se connecter au serveur. Vérifie ta connexion internet.");
    }
    if (
      error.code === "user_already_exists" ||
      error.code === "23505" ||
      error.message.includes("duplicate") ||
      error.message.includes("already registered")
    ) {
      throw new AuthError("Ce pseudo ou cet email est déjà utilisé.");
    }
    if (error.message.includes("Password")) {
      throw new AuthError("Le mot de passe ne respecte pas les critères de sécurité.");
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
  } catch (error: unknown) {
    if (isSupabaseAuthError(error) && (error.message === "Network request failed" || error.name === "TypeError")) {
      throw new AuthError("Impossible de se connecter au serveur. Vérifie ta connexion internet.");
    }
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
  // ... logout, getCurrentSession inchangés
};

