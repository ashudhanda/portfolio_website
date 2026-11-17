
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

/**
 * Theme toggle button with an animated sun/moon icon swap.
 *
 * Behaviour: defaults to dark mode on first visit (see the ThemeProvider in
 * App.tsx) and delegates all persistence and DOM work to next-themes via
 * useTheme() — this component only flips the theme and shows a toast.
 * An earlier version kept its own localStorage + <html> class bookkeeping,
 * which duplicated the provider's state and could drift from it.
 */
const ThemeSwitcher = () => {
  // next-themes owns the stored preference and the `dark` class on <html>.
  // theme is undefined until the provider hydrates, so fall back to the
  // default ("dark") for the first paint.
  const { theme, setTheme } = useTheme();
  const currentTheme = theme ?? "dark";
  const { toast } = useToast();

  const toggleTheme = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);

    if (newTheme === "dark") {
      toast({
        title: "Dark Mode Activated",
        description: "Your eyes will thank you later! 😎",
        duration: 2000,
      });
    } else {
      toast({
        title: "Light Mode Activated",
        description: "Brightness is on! ☀️",
        duration: 2000,
      });
    }
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className={`relative rounded-full w-10 h-10 flex items-center justify-center transition-all duration-500 overflow-hidden ${
        currentTheme === "dark" 
          ? "bg-primary/10 hover:bg-primary/20 text-primary" 
          : "bg-secondary hover:bg-secondary/80"
      }`}
      aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTheme}
            initial={{ 
              opacity: 0, 
              rotate: currentTheme === "light" ? 45 : -45,
              scale: 0.2
            }}
            animate={{ 
              opacity: 1, 
              rotate: 0,
              scale: 1
            }}
            exit={{ 
              opacity: 0, 
              rotate: currentTheme === "light" ? -45 : 45,
              scale: 0.2
            }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 200,
              damping: 10
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {currentTheme === "light" ? (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Background animation */}
        <motion.div
          key={`${currentTheme}-bg`}
          className="absolute inset-0 rounded-full"
          initial={{ scale: 0 }}
          animate={{ 
            scale: [0, 20, 0],
            backgroundColor: currentTheme === "dark" ? "#8b5cf6" : "#fbbf24"
          }}
          transition={{ duration: 1.5 }}
        />
      </div>
    </Button>
  );
};

export default ThemeSwitcher;
