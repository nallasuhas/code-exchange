import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { AppwriteException, ID, Models } from "appwrite";
import { account } from "@/models/client/config";
import { OAuthProvider } from "appwrite";

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
          console.log(error);
        }
      },
      async githubLogin(){
        try{
           await account.createOAuth2Session(
                OAuthProvider.Github, // provider
                'http://localhost:3000/', // redirect here on success
                'http://localhost:3000/login', // redirect here on failure
                 // scopes (optional)
            );
            const session = await account.getSession("current");
            const user = await account.get<UserPrefs>()
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
          console.log(error);
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },
      async googleLogin(){
        try{
          const successUrl = 'http://localhost:3000/';
          const failureUrl = 'http://localhost:3000/login';
          
          // Start OAuth flow
          await account.createOAuth2Session(
            OAuthProvider.Google,
            successUrl,
            failureUrl
          );

          // Only proceed if we have a valid session
          const session = await account.getSession("current");
          if (!session) {
            throw new Error("No valid session found after OAuth flow");
          }

          // Get user data
          const user = await account.get<UserPrefs>();
          
          // Initialize user preferences if needed
          if (!user.prefs?.reputation) {
            await account.updatePrefs<UserPrefs>({
              reputation: 0,
            });
          }

          // Update state
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
          console.log(error);
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
          console.log(error);
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
          console.log(error);
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
