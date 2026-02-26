# Deployment Guide - AI RPG Dungeon Master

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **OpenAI API Key**: Get one from [platform.openai.com](https://platform.openai.com)
3. **Git Repository** (optional but recommended)

## Environment Variables

Before deploying, you need to set up your environment variables. You'll need at least:

- `OPENAI_API_KEY` - **Required** for the AI Dungeon Master

Optional API keys for enhanced features:
- `ANTHROPIC_API_KEY` - For Claude AI integration
- `GOOGLE_AI_API_KEY` - For Google's AI models
- `STABILITY_API_KEY` - For Stable Diffusion image generation
- `ELEVENLABS_API_KEY` - For text-to-speech narration

## Local Development

1. **Create your `.env` file**:
   ```bash
   cp .env.example .env
   ```

2. **Add your API keys** to the `.env` file:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## Deploying to Vercel

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Add environment variables**:
   - During deployment, Vercel will prompt you to add environment variables
   - Or add them later in the Vercel dashboard under Settings > Environment Variables

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Method 2: Vercel Dashboard

1. **Push code to GitHub** (or GitLab/Bitbucket):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Import on Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**:
   - In the import screen, add your environment variables
   - At minimum, add `OPENAI_API_KEY`

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live!

## Post-Deployment

### Custom Domain (Optional)
1. Go to your project settings in Vercel
2. Navigate to Domains
3. Add your custom domain
4. Follow DNS configuration instructions

### Monitoring
- Check the Vercel Analytics dashboard for usage stats
- Monitor API costs in your OpenAI dashboard

### Updates
To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push
```
Vercel will automatically rebuild and deploy.

## Troubleshooting

### Common Issues

1. **"Missing API Key" errors**:
   - Verify environment variables are set in Vercel dashboard
   - Redeploy after adding variables

2. **Build fails**:
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json

3. **API rate limits**:
   - Monitor OpenAI usage dashboard
   - Consider upgrading your OpenAI plan if needed

4. **Characters not saving**:
   - Browser storage issue - clear cache and reload
   - Check browser console for errors

## Cost Considerations

This app uses:
- **Vercel**: Free tier is usually sufficient for personal use
- **OpenAI GPT-4**: ~$0.01-0.03 per request (varies by length)
- **DALL-E 3**: ~$0.04 per image (if using image generation)

For personal use, costs should be minimal ($5-20/month depending on usage).

## Security Notes

- Never commit `.env` files to git (already in `.gitignore`)
- Keep API keys secret
- Rotate keys if exposed
- Monitor API usage for unexpected activity
