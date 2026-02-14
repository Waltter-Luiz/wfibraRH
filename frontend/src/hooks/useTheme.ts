import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export const useTheme = () => {
    const [theme, setThemeState] = useState<Theme>("light");

    useEffect(() => {
        const savedTheme = (localStorage.getItem("theme") as Theme) || "light";
        setTheme(savedTheme);
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("theme", newTheme);

        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return { theme, toggleTheme, setTheme };
};
