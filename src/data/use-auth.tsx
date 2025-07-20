import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInAnonymously: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'github' | 'google') => Promise<{ error: any }>;
  signInWithWallet: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { publicKey, connect, connected, disconnect } = useWallet();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'anonymous');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInAnonymously = async () => {
    try {
      const { error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        // If anonymous sign-in is disabled, provide a helpful error message
        if (error.message.includes('Anonymous sign-ins are disabled')) {
          return { 
            error: { 
              message: 'Guest access is currently disabled. Please sign up with email or use social login.' 
            } 
          };
        }
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      return { 
        error: { 
          message: 'Unable to continue as guest. Please try signing up with email.' 
        } 
      };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: name ? { full_name: name } : undefined
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    // Disconnect wallet if connected
    if (connected) {
      try {
        await disconnect();
      } catch (error) {
        console.log('Wallet disconnect error:', error);
      }
    }
    await supabase.auth.signOut();
  };

  const signInWithProvider = async (provider: 'github' | 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    
    return { error };
  };

  const signInWithWallet = async () => {
    try {
      console.log('Starting wallet authentication...', { connected, publicKey: publicKey?.toString() });
      
      // Connect to wallet first
      if (!connected) {
        console.log('Attempting to connect wallet...');
        await connect();
        console.log('Connect attempt completed', { connected, publicKey: publicKey?.toString() });
      }

      if (!publicKey) {
        console.error('No public key after connection attempt');
        return { error: { message: 'Wallet connection failed. Please try again.' } };
      }

      // Create a message to sign
      const message = `Sign in to AnchorFlow\nWallet: ${publicKey.toString()}\nTimestamp: ${Date.now()}`;
      const messageBytes = new TextEncoder().encode(message);

      // For now, we'll create an anonymous session and store wallet info
      // In a production app, you'd want to verify the wallet signature
      const { error } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            wallet_address: publicKey.toString(),
            auth_method: 'wallet'
          }
        }
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Wallet authentication error:', error);
      return { error: { message: error.message || 'Wallet authentication failed' } };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signInAnonymously,
      signOut,
      signInWithProvider,
      signInWithWallet
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
