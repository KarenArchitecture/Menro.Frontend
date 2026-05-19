// src/Context/DrawerStateContext.jsx
import React, { createContext, useContext, useState } from "react";

const DrawerStateContext = createContext();

export const DrawerStateProvider = ({ children }) => {
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    return (
        <DrawerStateContext.Provider value={{ isDrawerOpen, setDrawerOpen }}>
        {children}
        </DrawerStateContext.Provider>
    );
};

export const useDrawerState = () => useContext(DrawerStateContext);
