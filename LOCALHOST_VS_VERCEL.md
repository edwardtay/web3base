# Localhost vs Vercel Configuration Differences

## Summary of Changes Made

### Issues Fixed

1. **Frontend API URL Detection**
   - ✅ Fixed: Now checks for `window.__API_URL__` (injected by Vercel build) first
   - ✅ Fixed: Localhost now uses port `8080` (was `9000`)
   - ✅ Fixed: Better fallback logic with console logging

2. **CORS Configuration**
   - ✅ Fixed: Now allows all `*.vercel.app` domains automatically
   - ✅ Fixed: Configurable via `ALLOWED_ORIGINS` environment variable

## How It Works

### Localhost (Development)

When running locally:
- Frontend detects `localhost` or `127.0.0.1`
- Uses API URL: `http://localhost:8080`
- CORS allows all origins in development mode

### Vercel (Production)

When deployed on Vercel:
1. **Build Process:**
   - Vercel runs `bash _vercel_build.sh` during build
   - Script injects `API_URL` environment variable into `index.html` as `window.__API_URL__`
   - Frontend code checks for this injected value first

2. **API URL Priority:**
   ```
   1. window.__API_URL__ (from Vercel build) ← Highest priority
   2. localhost detection (if on localhost)
   3. Fallback to hardcoded production URL
   ```

3. **CORS:**
   - Backend automatically allows `*.vercel.app` domains
   - Can also configure via `ALLOWED_ORIGINS` env var

## Configuration Required

### For Vercel Deployment

1. **Set Environment Variable in Vercel Dashboard:**
   ```
   API_URL=https://webwatcher.lever-labs.com
   ```
   Or your actual backend URL (Google Cloud Run, etc.)

2. **Verify Build Script:**
   - The `_vercel_build.sh` script should inject this into `index.html`
   - Check build logs to confirm: `✓ API_URL successfully injected`

3. **Backend CORS (if needed):**
   - Vercel domains (`*.vercel.app`) are automatically allowed
   - For custom domains, add to `ALLOWED_ORIGINS` env var:
     ```
     ALLOWED_ORIGINS=https://your-custom-domain.com,https://another-domain.com
     ```

## Debugging

### Check Frontend API URL

Open browser console on your Vercel deployment and look for:
```
🚀 Web3Base loaded - API: <url>
🔧 Environment: { isLocalhost: false, hostname: "...", hasInjectedUrl: true, ... }
```

### Check if API_URL was injected

In browser console:
```javascript
console.log(window.__API_URL__);
```

Should show your backend API URL.

### Check CORS

If you see CORS errors:
1. Check backend logs for: `CORS blocked origin: <origin>`
2. Verify your Vercel domain matches `*.vercel.app` pattern
3. Or add your domain to `ALLOWED_ORIGINS` env var on backend

## Testing Locally

To test Vercel build locally:

```bash
cd frontend
export API_URL="https://your-backend-url.com"
bash _vercel_build.sh

# Verify injection
grep "__API_URL__" index.html

# Test locally
python3 -m http.server 3001
# Open http://localhost:3001
# Check console for API URL being used
```

## Key Differences

| Aspect | Localhost | Vercel |
|--------|-----------|--------|
| API URL | `http://localhost:8080` | From `API_URL` env var (injected) |
| Detection | Hostname check | `window.__API_URL__` check |
| CORS | Allows all (dev mode) | Allows `*.vercel.app` + configured |
| Build | No build needed | Runs `_vercel_build.sh` |

## Troubleshooting

### Vercel not connecting to backend

1. **Check API_URL env var:**
   - Vercel Dashboard → Settings → Environment Variables
   - Ensure `API_URL` is set correctly

2. **Check build logs:**
   - Look for: `✓ API_URL successfully injected: <url>`
   - If missing, build script may have failed

3. **Check browser console:**
   - Look for API URL being used
   - Check for CORS errors

4. **Check backend CORS:**
   - Backend should allow `*.vercel.app` domains
   - Check backend logs for CORS blocks

### Localhost not working

1. **Check server is running:**
   ```bash
   lsof -i :8080
   curl http://localhost:8080/healthz
   ```

2. **Check browser console:**
   - Should show: `🏠 Using localhost API: http://localhost:8080`

3. **Check CORS:**
   - Development mode allows all origins
   - Should not be a CORS issue locally

