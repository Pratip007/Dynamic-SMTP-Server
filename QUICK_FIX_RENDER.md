# ⚠️ QUICK FIX: Render Deployment - Missing Environment Variables

## The Problem

Your **build succeeded**, but the **server can't start** because environment variables are missing in Render.

```
✗ Unable to start server: Error: MONGODB_URI or MONGODB_CONNECTION_STRING environment variable is required
```

## ✅ Solution: Add Environment Variables in Render

### Quick Steps:

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com
   - Click on your service name

2. **Add Environment Variables:**
   - Click **"Environment"** tab (left sidebar)
   - Click **"Add Environment Variable"** button

3. **Add These Variables:**

   **Variable 1 - MONGODB_URI:**
   ```
   Key: MONGODB_URI
   Value: mongodb+srv://db:db@cluster0.rrt2feq.mongodb.net/Cluster0?retryWrites=true&w=majority
   ```
   (Replace `db:db` with your actual MongoDB credentials if different)

   **Variable 2 - ENCRYPTION_KEY:**
   ```
   Key: ENCRYPTION_KEY
   Value: [Generate this on your local machine]
   ```
   
   Generate the encryption key locally:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and paste as the value.

   **Variable 3 - NODE_ENV (Optional but recommended):**
   ```
   Key: NODE_ENV
   Value: production
   ```

4. **Save Changes:**
   - Click **"Save Changes"**
   - Render will automatically redeploy
   - Wait 2-3 minutes

5. **Verify:**
   - Check the **"Logs"** tab
   - You should see:
     ```
     ✓ MongoDB connection established
     ✓ Server is running on http://localhost:PORT
     ```

## 📋 Complete Environment Variables Checklist

Make sure these are set in Render:

- [ ] `MONGODB_URI` - Your MongoDB connection string
- [ ] `ENCRYPTION_KEY` - 64-character hex string
- [ ] `NODE_ENV` - Set to `production` (optional)

## 🔍 How to Check if Variables are Set

1. Go to your service in Render dashboard
2. Click **"Environment"** tab
3. You should see all the variables listed

## 💡 Pro Tips

1. **MongoDB Connection String:**
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?options`
   - Make sure your MongoDB Atlas IP whitelist allows Render's IPs
   - Add `0.0.0.0/0` to whitelist to allow all IPs (for testing)

2. **Encryption Key:**
   - Generate a NEW one for production (don't use development key)
   - Must be exactly 64 characters (32 bytes hex)
   - Keep it secret!

3. **After Adding Variables:**
   - Render auto-redeploys
   - Check logs to verify connection

## ❓ Still Not Working?

1. **Check MongoDB Atlas:**
   - Cluster is running
   - IP whitelist includes Render IPs (or 0.0.0.0/0)
   - Username/password are correct

2. **Check Render Logs:**
   - Go to "Logs" tab
   - Look for specific error messages
   - Copy errors for troubleshooting

3. **Test Connection String Locally:**
   - Try connecting from your local machine
   - If it works locally, connection string is correct

---

**After adding environment variables, your service should start successfully!** 🚀
