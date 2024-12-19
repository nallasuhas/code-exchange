"use client";

import { useAuthStore } from "@/store/Auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { BackgroundLines } from "@/components/ui/background-lines";

const Layout = ({children}: {children: React.ReactNode}) => {
    // get session from auth store 
    const {session} = useAuthStore();
    const router = useRouter()

    useEffect(() => {
        // redirect the user to home page if user is logged in
        if(session){
            router.push("/")
        }
    }, [session, router])
    
    if (session) {
        return null
      } 
      // if user is not logged in return the children i.e, login and register pages
    return (
        <BackgroundLines> 
            <div className="relative flex min-h-screen flex-col items-center justify-center py-12">
            
            <div className="relative">{children}</div>
           </div>
   
        </BackgroundLines>
        
    )

}

export default Layout