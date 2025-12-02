# CORS Fix Documentation

## Problem
When running the app in development mode, you may encounter CORS (Cross-Origin Resource Sharing) errors when making API requests to `https://api.fourthofficial.ai`. This happens because browsers block requests from `localhost:5173` to a different domain for security reasons.

Error message:
```
Access to fetch at 'https://api.fourthofficial.ai/api/...' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## Solution
We've implemented a **Vite proxy** that forwards API requests through the development server, bypassing CORS restrictions.

## How It Works

### Development Mode
1. **Empty API Base URL**: `.env` file has `VITE_API_BASE_URL=` (empty)
2. **Vite Proxy**: `vite.config.ts` proxies all `/api/*` requests to `https://api.fourthofficial.ai`
3. **Same-Origin Requests**: Browser sees requests going to `localhost:5173/api/*` (same origin, no CORS)
4. **Proxy Forwards**: Vite forwards these to the real API

Request flow:
```
Frontend → localhost:5173/api/fixtures
         → Vite Proxy
         → https://api.fourthofficial.ai/api/fixtures
```

### Production Mode
1. **Direct API URL**: Set `VITE_API_BASE_URL=https://api.fourthofficial.ai`
2. **No Proxy**: Direct requests to the API
3. **CORS Handled**: Production API should have proper CORS headers

## Configuration Files

### vite.config.ts
```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://api.fourthofficial.ai',
      changeOrigin: true,
      secure: true,
      rewrite: (path) => path
    }
  }
}
```

**Options explained:**
- `target`: The real API server URL
- `changeOrigin`: Changes the origin of the host header to the target URL
- `secure`: Accepts SSL certificates (for HTTPS)
- `rewrite`: Keeps the path as-is (doesn't modify `/api` prefix)

### .env (Development)
```bash
# Leave empty to use Vite proxy
VITE_API_BASE_URL=
```

### .env.production (Production)
```bash
# Use full API URL in production
VITE_API_BASE_URL=https://api.fourthofficial.ai
```

## Setup Instructions

### For Development
1. **Restart Vite dev server** after changing config:
   ```bash
   npm run dev
   ```
   (Vite config changes require a restart)

2. **Verify .env file**:
   ```bash
   VITE_API_BASE_URL=
   ```
   (Empty or not set)

3. **Test API calls**:
   - Open browser console
   - Check Network tab
   - API calls should go to `localhost:5173/api/*`

### For Production Build
1. **Create .env.production**:
   ```bash
   VITE_API_BASE_URL=https://api.fourthofficial.ai
   ```

2. **Build the app**:
   ```bash
   npm run build
   ```

3. **Deploy**: The built files will use direct API URLs

## Troubleshooting

### Issue: Still seeing CORS errors
**Solutions:**
1. Restart the Vite dev server (`Ctrl+C` then `npm run dev`)
2. Clear browser cache and hard reload (`Ctrl+Shift+R`)
3. Check `.env` file has empty `VITE_API_BASE_URL`
4. Verify `vite.config.ts` has proxy configuration

### Issue: 404 Not Found on API requests
**Solution:**
- Check that API paths start with `/api`
- Verify the `target` URL in `vite.config.ts` is correct
- Check API endpoints exist on the server

### Issue: Proxy not working
**Solutions:**
1. Ensure Vite dev server is running (not production build)
2. Check console for Vite proxy logs
3. Verify `vite.config.ts` syntax is correct
4. Try changing `secure: true` to `secure: false` if using self-signed certificates

### Issue: API works in dev but not production
**Solution:**
- Production API must have proper CORS headers set
- Or deploy frontend and backend on the same domain
- Verify `.env.production` has the correct API URL

## Alternative Solutions

If the Vite proxy doesn't work for your setup, here are alternatives:

### 1. Browser CORS Extension (Not Recommended)
- Install "CORS Unblock" browser extension
- **Only for local development**
- **Security risk** - disable after testing

### 2. Backend CORS Configuration (Recommended)
Ask the backend team to add CORS headers:
```javascript
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 3. Same-Origin Deployment
Deploy frontend and backend on same domain:
- Frontend: `app.fourthofficial.ai`
- Backend: `app.fourthofficial.ai/api`

## Testing the Fix

Run these commands to test:

```bash
# Start dev server
npm run dev

# In another terminal, test API endpoint
curl http://localhost:5173/api/fixtures

# Should return data without CORS errors
```

## Notes
- Proxy only works in **development mode** (`npm run dev`)
- Production builds use direct API URLs
- Always restart Vite after config changes
- Check browser Network tab to verify proxy is working
