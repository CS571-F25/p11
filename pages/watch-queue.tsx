import { useRouter } from "next/router";
import { Menubar, MenubarItem } from "@/components/ui/menubar"
import { MenubarMenu, MenubarTrigger } from "@radix-ui/react-menubar";
import { motion } from 'framer-motion';

export default function watchQueue(){

    const router = useRouter(); 

    return(
        <div className="flex justify-center">
            {/* Include Profile Navigation Bar */}
                <Menubar className="mx-auto flex gap-4">
                    <MenubarMenu>
                        <MenubarTrigger 
                        className="hover:bg-primary hover:text-black rounded-md"
                        onClick={() => router.push("/profile-page")}>
                            Profile
                        </MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger 
                        className="hover:bg-primary hover:text-black rounded-md"
                        onClick={() => router.push("/watched")}>
                            Watched
                        </MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger 
                        className="hover:bg-primary hover:text-black rounded-md"
                        onClick={() => router.push("/watch-queue")}>
                            Movie Queue
                        </MenubarTrigger>
                    </MenubarMenu>
                </Menubar>
                <motion.div
                initial={{x: "100%"}}
                animate={{x: 0}}
                exit={{x: "-100%"}}
                transition={{duration: 0.5}}
                >
                </motion.div>
        </div>
    )
}

