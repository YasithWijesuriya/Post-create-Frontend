import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Gallery from "./components/Gallery";
import { BrowserRouter, Routes, Route } from 'react-router'
import { Provider } from "react-redux";
import { store } from "./lib/store";
import { ClerkProvider } from '@clerk/clerk-react';
import NavigationBar from "./components/NavigationBar"
import DisplayPost from "./components/DisplayPost";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY; 
createRoot(document.getElementById("root")).render(
  <StrictMode>    
    <ClerkProvider publishableKey={clerkPubKey}>
    <Provider store={store}>
      <BrowserRouter>
      <NavigationBar />
      <Routes>
        <Route path="/display" element={<DisplayPost/>}/>
        <Route path="/create"  element={<Gallery/>}/>
      </Routes>
      </BrowserRouter>
    </Provider>
    </ClerkProvider>
  </StrictMode>
);
