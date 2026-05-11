# Google OAuth — Guía de configuración

Esta guía describe los pasos manuales necesarios para activar "Continuar con Google" en Trazadía.

---

## 1. Google Cloud Console

### 1.1 Crear proyecto (si no existe)
- Ve a [console.cloud.google.com](https://console.cloud.google.com)
- Crea o selecciona el proyecto de Trazadía

### 1.2 Habilitar la API
- APIs & Services → Library → busca "Google Identity" → habilita **Google Identity Services**

### 1.3 Crear OAuth Client ID — tipo **Web**
- APIs & Services → Credentials → Create Credentials → OAuth Client ID
- Application type: **Web application**
- Nombre: `Trazadía Web`
- Authorized redirect URIs — agrega:
  ```
  https://umthhtrfqhwmkxrnomgn.supabase.co/auth/v1/callback
  ```
- Guarda el **Client ID** y el **Client Secret**

### 1.4 Crear OAuth Client ID — tipo **Android** (para builds de producción)
- Application type: **Android**
- Package name: `com.midia.app`
- SHA-1 certificate fingerprint: obtenlo con:
  ```bash
  # Debug keystore
  keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android
  ```
- Para producción, usa el SHA-1 del keystore de EAS Build

---

## 2. Supabase Dashboard

- Ve a **Authentication → Providers → Google**
- Activa el toggle **Enable**
- Pega el **Client ID** (tipo Web) en "Client ID (for OAuth)"
- Pega el **Client Secret** en "Client Secret"
- Guarda

### Linkeo de cuentas existentes
- En **Authentication → Settings** verifica que "Allow linking of existing accounts" esté activo
- Esto permite que un usuario que se registró con email/password pueda luego entrar con Google usando el mismo email (las identidades se fusionan)

---

## 3. Deep link en la app

El scheme ya está configurado en `app.json`:
```json
"scheme": "mi-dia"
```

El redirect URI generado por la app en producción es: `mi-dia://`

En Expo Go (desarrollo), `makeRedirectUri({ scheme: 'mi-dia' })` genera automáticamente el URI correcto para el entorno (`exp://...`). Para que este URI funcione en el OAuth flow, agrega también ese URI a los **Authorized redirect URIs** del Web Client ID en Google Cloud Console. El URI de Expo Go tiene el formato:
```
exp://192.168.x.x:8081
```

**Alternativa más simple para desarrollo**: usa el proxy de Expo Auth:
- Agrega `https://auth.expo.io/@tu-usuario/mi-dia` como redirect URI

---

## 4. Usuario de prueba para Google Play

Google Play requiere un usuario de prueba para revisar el flujo de Google Sign-In:

1. En Google Cloud Console → OAuth consent screen → Test users
2. Agrega el email del revisor de Google Play
3. En el comentario de la publicación en Play Console, incluye:
   - Email del usuario de prueba
   - Contraseña (si aplica para otras funciones)

---

## 5. Verificación

1. Ejecuta la app en Expo Go
2. Presiona "Continuar con Google"
3. Selecciona una cuenta Google
4. La app debe regresar y mostrar la pantalla principal (tabs)
5. Verifica en Supabase Dashboard → Authentication → Users que el usuario aparece con identidad `google`
