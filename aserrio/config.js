// CONFIGURACIÓN DE FIREBASE
// Pegue aquí los 4 datos de su proyecto (Firebase → Configuración del proyecto → Tus apps → "Configuración del SDK").
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBn5tZVTRc3WbOnM_VPTMNkCPgeXotNJFk",
  authDomain: "aserrio.firebaseapp.com",
  projectId: "aserrio",
  appId: "1:616256122843:web:9dd2337eba6411c9b241fe"
};

// Minutos de inactividad antes de cerrar la sesión automáticamente.
const SESION_MIN = 30;

// Déjelo en false para EXIGIR inicio de sesión (recomendado).
// Ponga true solo para probar sin Firebase: los datos quedan solo en ese navegador y sin contraseña.
const MODO_LOCAL = false;
