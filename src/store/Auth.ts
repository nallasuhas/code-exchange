import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { AppwriteException, ID, Models } from "appwrite";
import { account } from "@/models/client/config";
import { OAuthProvider } from "appwrite";
import env from "@/app/env";

export interface UserPrefs {
  reputation: number;
}

interface IAuthStore {
  session: Models.Session | null;
  jwt: string | null;
  user: Models.User<UserPrefs> | null;
  hydrated: boolean;
  setHydrated: () => void;
  verfiySession: () => Promise<void>;
  githubLogin: () => Promise<{ success: boolean; error?: AppwriteException | null }>;
  googleLogin: () => Promise<{ success: boolean; error?: AppwriteException | null }>;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: AppwriteException | null }>;
  createAccount: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: AppwriteException | null }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    immer<IAuthStore>((set) => ({
      session: null,
      jwt: null,
      user: null,
      hydrated: false,

      setHydrated() {
        set((state) => {
          state.hydrated = true;
        });
      },

      async verfiySession() {
        try {
          const session = await account.getSession("current");
          const user = await account.get<UserPrefs>();
          set((state) => {
            state.session = session;
            state.user = user;
          });
        } catch (error) {
          console.error("Session verification failed:", error);
          // Clear invalid session
          set((state) => {
            state.session = null;
            state.user = null;
            state.jwt = null;
          });
        }
      },

      async githubLogin(){
        try{
           const baseUrl = env.appwrite.endpoint.includes('localhost') 
             ? 'http://localhost:3000'
             : env.appwrite.endpoint;
           
           await account.createOAuth2Session(
                OAuthProvider.Github,
                `${baseUrl}/`,
                `${baseUrl}/login`,
           );
            const session = await account.getSession("current");
            const user = await account.get<UserPrefs>();
            
            if (!user.prefs?.reputation) {
              await account.updatePrefs<UserPrefs>({
                reputation: 0,
              });
            }
            
            set((state) => {
              state.session = session;
              state.user = user;
            });
   
            return { success: true };

        }catch(error){
          console.error("GitHub login failed:", error);
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },

      async googleLogin(){
        try{
          const baseUrl = env.appwrite.endpoint.includes('localhost')
            ? 'http://localhost:3000'
            : env.appwrite.endpoint;
          
          const successUrl = `${baseUrl}/`;
          const failureUrl = `${baseUrl}/login`;
          
          await account.createOAuth2Session(
            OAuthProvider.Google,
            successUrl,
            failureUrl
          );

          const session = await account.getSession("current");
          if (!session) {
            throw new Error("No valid session found after OAuth flow");
          }

          const user = await account.get<UserPrefs>();
          
          if (!user.prefs?.reputation) {
            await account.updatePrefs<UserPrefs>({
              reputation: 0,
            });
          }

          set((state) => {
            state.session = session;
            state.user = user;
          });

          return { success: true };
        } catch(error) {
          console.error("Google login error:", error);
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },

      async login(email, password) {
        try {
          const session = await account.createEmailPasswordSession(
            email,
            password
          );
          const [user, { jwt }] = await Promise.all([
            account.get<UserPrefs>(),
            account.createJWT(),
          ]);

          if (!user.prefs?.reputation) {
            await account.updatePrefs<UserPrefs>({
              reputation: 0,
            });
          }

          set((state) => {
            state.session = session;
            state.user = user;
            state.jwt = jwt;
          });

          return { success: true };
        } catch (error) {
          console.error("Login failed:", error);
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },

      async createAccount(name, email, password) {
        try {
          await account.create(ID.unique(), email, password, name);
          return { success: true };
        } catch (error) {
          console.error("Account creation failed:", error);
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },

      async logout() {
        try {
          await account.deleteSessions();
          set((state) => {
            state.session = null;
            state.jwt = null;
            state.user = null;
          });
        } catch (error) {
          console.error("Logout failed:", error);
          // Still clear the state even if the server request fails
          set((state) => {
            state.session = null;
            state.jwt = null;
            state.user = null;
          });
        }
      },
    })),
    {
      name: "auth",
      onRehydrateStorage() {
        return (state, error) => {
          if (!error) state?.setHydrated();
        };
      },
    }
  )
);
