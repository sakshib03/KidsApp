import React, { createContext, ReactNode, useContext, useState } from "react";

type Theme = {
  name: string;
  background: any;
  textColor: string;
  fontFamily: string;
  accentColor?: string;
  correctBg?: string;
  wrongBg?: string;
  correctText?: string;
  wrongText?: string;
  cardBg?: string;
  borderColor?: string;
};

type Goodie = {
  name: string;
  image: any;
  unlock_price: string;
  type: string;
};

type ThemeContextType = {
  theme: Theme;
  changeTheme: (themeName: keyof typeof themes) => void;
  themes: typeof themes;
  goodies: typeof goodies;
};

const goodies = {
  dancing_toy: {
    name: "Dancing Toy",
    image: require("../../../assets/images/rewards/dancing_toy.png"),
    unlock_price: "100",
    type: "avatar",
  },
  profile_frame: {
    name: "Profile Frame",
    image: require("../../../assets/images/rewards/profile_frame1.png"),
    unlock_price: "120",
    type: "frame",
  },
};

// ✅ Theme Definitions (kept your logic, added support for Question UI)
const themes = {
  default: {
    name: "default",
    background: require("../../../assets/images/login_image.png"),
    background2: require("../../../assets/images/background.png"),
    textColor: "#F25F3B",
    accentColor: "#F25F3B",
    correctBg: "#90EE90",
    wrongBg: "#FF7F7F",
    correctText: "#2E8B57",
    wrongText: "#B22222",
    cardBg: "#FFFFFFE0",
    borderColor: "#F25F3B",
    fontFamily: "ComicRelief-Regular",
    unlock_price: "0",
  },
  ocean: {
    name: "ocean",
    background: require("../../../assets/images/ocean.png"),
    background2: require("../../../assets/images/bg6.jpg"),
    textColor: "#FFFFFF",
    accentColor: "#00BFFF",
    correctBg: "#00CED1",
    wrongBg: "#4682B4",
    correctText: "#E0FFFF",
    wrongText: "#FFD700",
    cardBg: "#FFFFFF30",
    borderColor: "#00BFFF",
    fontFamily: "ComicRelief-Regular",
    unlock_price: "500",
  },
  desert: {
    name: "desert",
    background: require("../../../assets/images/desert.png"),
    background1: require("../../../assets/images/bg7.png"),
    background2: require("../../../assets/images/bg4.jpg"),
    background3: require("../../../assets/images/background.png"),
    background4: require("../../../assets/images/background.png"),
    textColor: "#8B4513",
    accentColor: "#C19A6B",
    correctBg: "#EEDC82",
    wrongBg: "#DEB887",
    correctText: "#654321",
    wrongText: "#8B0000",
    cardBg: "#FFF5E1E0",
    borderColor: "#C19A6B",
    fontFamily: "ComicRelief-Regular",
    unlock_price: "700",
  },

  space: {
    name: "space",
    background: require("../../../assets/images/space.jpg"),
    background2: require("../../../assets/images/bg5.jpg"),
    textColor: "#FFFFFF",
    accentColor: "#9370DB",
    correctBg: "#6A5ACD",
    wrongBg: "#8B0000",
    correctText: "#ADFF2F",
    wrongText: "#FF6347",
    cardBg: "#FFFFFF15",
    borderColor: "#9370DB",
    fontFamily: "ComicRelief-Regular",
    unlock_price: "1000",
  },
  // garden: {
  //   name: "garden",
  //   background: require("../../../assets/images/login_image.png"),
  //   textColor: "#FFFFFF",
  //   accentColor: "#2E8B57",
  //   correctBg: "#90EE90",
  //   wrongBg: "#8FBC8F",
  //   correctText: "#006400",
  //   wrongText: "#556B2F",
  //   cardBg: "#FFFFFF25",
  //   borderColor: "#2E8B57",
  //   fontFamily:"ComicRelief-Regular",
  // },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(themes.default);

  const changeTheme = (themeName: keyof typeof themes) => {
    const selectedTheme = themes[themeName] || themes.default;
    setTheme({ ...selectedTheme }); // ensures re-render
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, themes , goodies}}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ Easy hook to use anywhere
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
