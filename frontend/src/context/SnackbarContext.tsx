import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

interface SnackbarContextType {
  showMessage: (message: string, severity?: "success" | "error" | "info" | "warning") => void;
}

const SnackbarContext = createContext<SnackbarContextType>({ showMessage: () => {} });
export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("success");

  const showMessage = (msg: string, sev: "success" | "error" | "info" | "warning" = "success") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setOpen(false)} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
