# Render Deployment Guide

This guide will help you deploy the Dynamic SMTP Server to Render.

## Prerequisites

- GitHub account with your repository
- Render account (sign up at [render.com](https://render.com))
- MongoDB Atlas account with a cluster set up

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 tier)
3. Create a database user:
   - Username: `db` (or your choice)
   - Password: `db` (or your secure password)
4. Whitelist IP addresses:
   - For Render, add `0.0.0.0/0` (allows all IPs)
   - Or get Render's IP ranges and add them
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?options`

## Step 2: Deploy to Render

### 2.1 Create New Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository: `Dynamic-SMTP-Server`

### 2.2 Configure Service

**Basic Settings:**
- **Name**: `dynamic-smtp-server` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: (leave empty)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 2.3 Set Environment Variables

**⚠️ CRITICAL: Add these environment variables in Render dashboard:**

Click on **"Environment"** tab and add:

1. **MONGODB_URI** (Required)
   ```
   mongodb+srv://db:db@cluster0.rrt2feq.mongodb.net/Cluster0?retryWrites=true&w=majority
   ```
   Replace `db:db` with your actual MongoDB username and password.

2. **ENCRYPTION_KEY** (Required)
   ```
   Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the generated key and paste it here.

3. **NODE_ENV** (Optional, but recommended)
   ```
   production
   ```

4. **PORT** (Optional - Render sets this automatically)
   ```
   (Leave empty - Render will set this automatically)
   ```

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (2-5 minutes)

## Step 3: Verify Deployment

After deployment completes:

1. Check the logs in Render dashboard
2. You should see:
   ```
   ✓ MongoDB connection established
   ✓ Server is running on http://localhost:PORT
   ```

3. Visit your service URL (provided by Render):
   - Example: `https://dynamic-smtp-server.onrender.com`
   - Admin Dashboard: `https://dynamic-smtp-server.onrender.com/admin`
   - Health Check: `https://dynamic-smtp-server.onrender.com/health`

## Troubleshooting

### Build Failed

**Error:** `MONGODB_URI environment variable is required`

**Solution:**
1. Go to Render Dashboard → Your Service → **Environment**
2. Click **"Add Environment Variable"**
3. Key: `MONGODB_URI`
4. Value: Your MongoDB connection string
5. Click **"Save Changes"**
6. Service will auto-deploy

### MongoDB Connection Failed

**Error:** `MongoDB connection error: authentication failed`

**Solutions:**
1. Verify MongoDB username/password in connection string
2. Check MongoDB Atlas IP whitelist includes Render's IPs
3. Verify database name is correct in connection string

### Service Crashes on Start

1. Check **Logs** tab in Render dashboard
2. Common issues:
   - Missing `ENCRYPTION_KEY` - Add it in Environment variables
   - Invalid `MONGODB_URI` format - Check connection string
   - MongoDB cluster not accessible - Check IP whitelist

### Health Check Fails

1. Visit: `https://your-service.onrender.com/health`
2. Should return:
   ```json
   {
     "status": "ok",
     "database": {
       "mongodb": "connected"
     }
   }
   ```
3. If `"mongodb": "disconnected"`, check MongoDB connection string

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | MongoDB Atlas connection string |
| `ENCRYPTION_KEY` | ✅ Yes | 64-character hex string for encrypting passwords |
| `NODE_ENV` | ❌ No | Set to `production` |
| `PORT` | ❌ No | Automatically set by Render |

## Updating Environment Variables

1. Go to Render Dashboard → Your Service
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"** or edit existing
4. Save changes
5. Service will automatically redeploy

## Monitoring

- **Logs**: View real-time logs in Render dashboard
- **Metrics**: Monitor CPU, memory, and response times
- **Health**: Check `/health` endpoint regularly

## Production Best Practices

1. ✅ Use strong MongoDB password
2. ✅ Generate new `ENCRYPTION_KEY` for production (don't reuse from development)
3. ✅ Restrict MongoDB IP whitelist (add only Render IPs if possible)
4. ✅ Enable HTTPS (Render provides this automatically)
5. ✅ Monitor logs regularly
6. ✅ Set up alerts in Render dashboard

## Free Tier Limitations

Render's free tier:
- Services sleep after 15 minutes of inactivity
- First request after sleep takes longer (cold start)
- Consider upgrading to paid plan for always-on service

---

**Need Help?**

- Check Render documentation: [render.com/docs](https://render.com/docs)
- Check application logs in Render dashboard
- Verify all environment variables are set correctly

