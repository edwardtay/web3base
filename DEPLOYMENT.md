# Deployment Guide

This application can be deployed on multiple platforms concurrently without conflicts.

## 🚀 Vercel Deployment

### Prerequisites
- GitHub account connected to Vercel
- All API keys ready

### Steps

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository: `edwardtay/web3base`

2. **Configure Environment Variables**
   
   Go to Project Settings → Environment Variables and add:
   
   **Required:**
   ```
   NODE_ENV=production
   SERVE_FRONTEND=true
   OPENAI_API_KEY=your_openai_key
   CDP_API_KEY_ID=your_cdp_key_id
   CDP_API_KEY_SECRET=your_cdp_secret
   CDP_WALLET_SECRET=your_wallet_secret
   NETWORK_ID=base-sepolia
   ```
   
   **Optional (for full features):**
   ```
   EXA_API_KEY=your_exa_key
   MORALIS_API_KEY=your_moralis_key
   BLOCKSCOUT_API_KEY=your_blockscout_key
   ALCHEMY_API_KEY=your_alchemy_key
   THIRDWEB_SECRET_KEY=your_thirdweb_key
   NANSEN_API_KEY=your_nansen_key
   METASLEUTH_LABEL_API_KEY=your_metasleuth_label_key
   METASLEUTH_RISK_API_KEY=your_metasleuth_risk_key
   PASSPORT_API_KEY=your_passport_key
   URLSCAN_API_KEY=your_urlscan_key
   LETTA_API_KEY=your_letta_key
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Vercel Configuration
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Framework Preset: Other

---

## ☁️ AWS Amplify Deployment

### Prerequisites
- AWS Account
- GitHub repository access
- All API keys ready

### Steps

1. **Open AWS Amplify Console**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" → "Host web app"

2. **Connect Repository**
   - Select "GitHub"
   - Authorize AWS Amplify to access your GitHub
   - Select repository: `edwardtay/web3base`
   - Select branch: `master`

3. **Configure Build Settings**
   
   Amplify will auto-detect the `amplify.yml` file. Verify it shows:
   
   ```yaml
   version: 1
   backend:
     phases:
       build:
         commands:
           - npm ci
           - npm run build
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: /
       files:
         - 'dist/**/*'
         - 'frontend/**/*'
         - 'api/**/*'
         - 'package.json'
         - 'node_modules/**/*'
   ```

4. **Add Environment Variables**
   
   In Amplify Console → App settings → Environment variables, add:
   
   **Required:**
   ```
   NODE_ENV=production
   SERVE_FRONTEND=true
   OPENAI_API_KEY=your_openai_key
   CDP_API_KEY_ID=your_cdp_key_id
   CDP_API_KEY_SECRET=your_cdp_secret
   CDP_WALLET_SECRET=your_wallet_secret
   NETWORK_ID=base-sepolia
   PORT=3000
   ```
   
   **Optional (same as Vercel):**
   - All the optional API keys listed above

5. **Advanced Settings**
   - Node.js version: 18 or higher
   - Build timeout: 15 minutes (for large dependencies)
   - Enable automatic builds on push

6. **Deploy**
   - Click "Save and deploy"
   - Wait for build to complete (5-10 minutes)
   - Your app will be live at `https://master.xxxxx.amplifyapp.com`

### Custom Domain (Optional)
- Go to Domain management
- Add your custom domain
- Follow DNS configuration instructions

---

## 🔄 Concurrent Deployments

You can run both Vercel and AWS Amplify deployments simultaneously:

- **Vercel URL**: `https://web3base.vercel.app`
- **Amplify URL**: `https://master.xxxxx.amplifyapp.com`

Both will:
- Deploy from the same GitHub repository
- Use the same codebase
- Have independent environment variables
- Scale independently
- Have no conflicts

### Use Cases for Multiple Deployments:

1. **Redundancy**: If one platform has issues, the other is still available
2. **Testing**: Test on different platforms before choosing one
3. **Geographic Distribution**: Use different platforms for different regions
4. **A/B Testing**: Compare performance between platforms

---

## 🐳 Google Cloud Run Deployment (Alternative)

If you prefer Google Cloud Run:

1. **Build Docker Image**
   ```bash
   docker build -t web3base .
   ```

2. **Push to Google Container Registry**
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/web3base
   ```

3. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy web3base \
     --image gcr.io/YOUR_PROJECT_ID/web3base \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production,SERVE_FRONTEND=true \
     --set-secrets OPENAI_API_KEY=openai-key:latest
   ```

---

## 🔍 Troubleshooting

### Vercel Issues

**Frontend not loading:**
- Check `SERVE_FRONTEND=true` is set
- Verify `frontend/` directory is in repository
- Check build logs for errors

**API errors:**
- Verify all required environment variables are set
- Check function logs in Vercel dashboard
- Ensure API keys are valid

### AWS Amplify Issues

**Build fails:**
- Check Node.js version (should be 18+)
- Increase build timeout if needed
- Check build logs for specific errors

**Environment variables not working:**
- Ensure variables are set in Amplify Console, not just amplify.yml
- Redeploy after adding variables

**Frontend 404:**
- Verify `amplify.yml` artifacts include `frontend/**/*`
- Check that `SERVE_FRONTEND=true` is set

---

## 📊 Monitoring

### Vercel
- Analytics: Built-in analytics dashboard
- Logs: Real-time function logs
- Performance: Web Vitals tracking

### AWS Amplify
- CloudWatch: Automatic logging
- Metrics: Request count, latency, errors
- Alarms: Set up CloudWatch alarms

---

## 💰 Cost Comparison

### Vercel
- **Free Tier**: 100GB bandwidth, 100 hours serverless execution
- **Pro**: $20/month - More bandwidth and execution time
- **Best for**: Quick deployments, serverless functions

### AWS Amplify
- **Free Tier**: 1000 build minutes/month, 15GB storage, 5GB bandwidth
- **Pay-as-you-go**: $0.01 per build minute, $0.023 per GB storage
- **Best for**: AWS ecosystem integration, more control

---

## 🎯 Recommendation

**For this project:**
- **Start with Vercel**: Easier setup, better for Node.js/Express apps
- **Add Amplify later**: If you need AWS integration or redundancy

Both platforms will work great for this application!
