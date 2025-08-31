# Consumer Application Integration Guide

This guide shows how to integrate your application with the **CautionTape ID Service** for unified authentication across multiple applications.

---

## Prerequisites

Your application needs:

- **Supabase client** configured with the same Supabase project as the ID Service
- A route handler for `/auth/ready` to receive authentication tokens
- A login button/flow that redirects to the ID Service

### Install Dependencies

```bash
npm add @supabase/supabase-js
# Add your preferred router (react-router-dom, Next.js router, etc.)
```

### Environment Variables

```env
# Same Supabase project as ID Service
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
# (or VITE_SUPABASE_ANON_KEY for legacy)

# ID Service URL
VITE_ID_SERVICE_URL=https://devid.ctedu.ca
# Development: https://devid.ctedu.ca
# Production: https://id.ctedu.ai
```

---

## 1) Setup Supabase Client

Configure your Supabase client to use the **same Supabase project** as the ID Service:

```ts
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Important: disable for consumer apps
  },
});
```

---

## 2) Implement Authentication Guard

**Important**: Consumer apps should **not** have their own login UI. Instead, they should immediately redirect unauthenticated users to the ID Service.

### Authentication Guard Component

```tsx
// components/AuthGuard.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function AuthGuard({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        // No local login UI - redirect to ID Service immediately
        redirectToIdService();
      } else {
        setUser(user);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        redirectToIdService();
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const redirectToIdService = () => {
    const returnTo = `${location.origin}/auth/ready?next=${encodeURIComponent(location.pathname + location.search)}`;
    const idServiceUrl =
      import.meta.env.VITE_ID_SERVICE_URL || "https://devid.ctedu.ca";
    const url = `${idServiceUrl}/login?return_to=${encodeURIComponent(returnTo)}`;

    location.assign(url); // Full page redirect to ID Service
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Redirecting to authentication...</div>;

  return children;
}
```

### Usage in Your App

```tsx
// App.tsx
import { AuthGuard } from "./components/AuthGuard";

export default function App() {
  return (
    <AuthGuard>
      {/* Your protected app content */}
      <YourAppContent />
    </AuthGuard>
  );
}
```

---

## 3) Implement Auth Ready Endpoint

### Auth Ready Page

```tsx
// pages/AuthReady.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthReady() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      // Extract tokens from URL hash (sent by ID Service)
      const hash = new URLSearchParams(location.hash.slice(1));
      const access_token = hash.get("access_token");
      const refresh_token = hash.get("refresh_token");

      if (!access_token || !refresh_token) {
        console.error("Missing tokens from ID Service");
        navigate("/login");
        return;
      }

      // Set session in your app
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error("Failed to set session:", error);
        navigate("/login");
        return;
      }

      // Clean up URL and redirect to intended destination
      history.replaceState(null, "", location.pathname);
      const next = searchParams.get("next") || "/";
      navigate(next);
    })();
  }, [navigate, searchParams]);

  return (
    <div className="p-6">
      <p>Completing sign-in...</p>
    </div>
  );
}
```

## 4) Router Setup

Add the auth ready route to your app's router:

```tsx
// App.tsx or main router file
import { createBrowserRouter } from "react-router-dom";
import AuthReady from "./pages/AuthReady";

const router = createBrowserRouter([
  // ... your existing routes
  { path: "/auth/ready", element: <AuthReady /> },
]);
```

## 5) Cross-Tab Logout (Optional)

Listen for logout events from ID Service:

```tsx
// In your main app component or auth context
useEffect(() => {
  const channel = new BroadcastChannel("auth");

  channel.onmessage = (event) => {
    if (event.data?.type === "signed_out") {
      // User logged out from ID Service, sign out locally
      supabase.auth.signOut();
    }
  };

  return () => channel.close();
}, []);
```

---

## 6) Authentication Flow Summary

1. **User clicks login** in your app
2. **Popup/redirect** to ID Service `/login?return_to=yourdomain.com/auth/ready`
3. **User completes OAuth** (Google/Microsoft) on ID Service
4. **ID Service redirects** back to `yourdomain.com/auth/ready#access_token=...`
5. **Your `/auth/ready` page** extracts tokens and calls `supabase.auth.setSession()`
6. **User is authenticated** and redirected to intended page

---

## 7) Domain Allowlist Registration

To use the ID Service, your application domain must be registered in the ID Service's allowlist.

**For development**: `localhost` ports are pre-configured
**For production**: Contact the ID Service administrator to add your domain

Supported patterns:

- Exact domains: `https://myapp.example.com`
- Wildcard subdomains: `*.example.com` (matches `app.example.com`, `admin.example.com`, etc.)

---

## 8) Testing the Integration

1. **Start your app** with the `/auth/ready` route implemented
2. **Click your login button** - should open ID Service popup/redirect
3. **Complete OAuth flow** - should return to your app with active session
4. **Verify session**: Check that `supabase.auth.getUser()` returns the authenticated user

### Troubleshooting

- **Popup blocked**: Login button should fallback to redirect
- **Missing tokens**: Check browser console for errors in `/auth/ready`
- **Session not set**: Verify Supabase configuration matches ID Service
- **Domain rejected**: Ensure your domain is in the ID Service allowlist

---

## 9) Production Deployment

1. **Configure environment variables** for your production environment
2. **Request domain registration** with ID Service administrator
3. **Test end-to-end flow** in production environment
4. **Monitor for authentication errors** and session persistence

**Security note**: The ID Service validates all return URLs against a strict allowlist for security. Unauthorized domains will be rejected.

---

## 10) Logout Integration

To trigger global logout across all applications:

```tsx
// In your logout handler
const logoutEverywhere = () => {
  const idServiceUrl =
    import.meta.env.VITE_ID_SERVICE_URL || "https://devid.ctedu.ca";

  // Option 1: Redirect to ID Service logout with return_to
  const returnTo = `${location.origin}/login`; // or wherever you want users after logout
  location.assign(
    `${idServiceUrl}/logout?return_to=${encodeURIComponent(returnTo)}`,
  );

  // Option 2: Logout without return_to (goes to ID Service login page)
  // location.assign(`${idServiceUrl}/logout`);

  // Option 3: Local logout + broadcast (if using cross-tab sync)
  // supabase.auth.signOut();
  // new BroadcastChannel("auth").postMessage({ type: "signed_out" });
};
```

This ensures consistent logout behavior across all integrated applications.
