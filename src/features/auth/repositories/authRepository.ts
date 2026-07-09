import { supabase } from "@/core/supabase/client";

export const authRepository = {
async signUp(username: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error("Signup failed: no user returned");

  return data;
},

  async signIn(username: string, password: string) {
    // 1. Retrouver l'email correspondant au username via la fonction SQL
    const { data: email, error: lookupError } = await supabase.rpc(
      "get_email_by_username",
      { p_username: username }
    );
    if (lookupError) throw lookupError;
    if (!email) throw new Error("Nom d'utilisateur introuvable");

    // 2. Connexion classique avec l'email retrouvé
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
};