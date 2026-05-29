import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import AdminSidebar from "@components/layout/AdminSidebar";
import { auth } from "../../services/firebaseConfig.js";
import styles from "./PrivateLayout.module.css";

export default function PrivateLayout() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(Boolean(user));
      setIsChecking(false);
    });

    return unsubscribe;
  }, []);

  if (isChecking) {
    return <div className={styles.authLoader}>Verificando credenciais de segurança...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <>
      <AdminSidebar />
      <Outlet />
    </>
  );
}