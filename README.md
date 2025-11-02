# Sendcatstomars

## Project Description
Many individuals experiencing emotional or mental-health challenges hesitate to seek support due to social stigma. Meanwhile, expressing vulnerability seems to be a sign of weakness, leading them to hide their struggles rather than reach out for help. Many people stay silent because they are afraid of being judged. So, they avoid traditional counselling even when they need support. As a result, individuals across different ages and life stages often manage their emotional burdens in silence. Our solution provides a safe and private space for mental-health support. Hence, we use advanced AI models to understand users' emotions. The platform delivers guidance that is personalized to each individual. Users of all ages can freely express themselves and reflect on their feelings. They receive meaningful support without fear of judgment or exposure. This approach bridges the gap between silent struggles and compassionate care.

## Problem Statement
Many individuals experiencing emotional or mental-health challenges hesitate to seek support due to social stigma. Meanwhile, expressing vulnerability seems to be a sign of weakness, leading them to hide their struggles rather than reach out for help. Many people stay silent because they are afraid of being judged. So, they avoid traditional counselling even when they need support. As a result, individuals across different ages and life stages often manage their emotional burdens in silence.

## Key Features
- AI-powered chat support for emotional guidance
- Private and judgment-free environment
- Google authentication for secure access
- Chat session history and summaries
- Memory generation and reflection panels
- Interactive manga/comic generation
- 3D interactive elements for engaging user experience

## Tech Stack
- **Frontend:** Next.js 16, React 19, TypeScript
- **Database:** MongoDB
- **AI:** OpenAI API
- **Authentication:** Google OAuth
- **Styling:** Tailwind CSS
- **3D Graphics:** Three.js, React Three Fiber, Spline
- **Media Storage:** Cloudinary
- **State Management:** Jotai

## How to Deploy

### Prerequisites
- Node.js (v20 or higher)
- MongoDB database
- Google OAuth credentials
- OpenAI API key
- Cloudinary account

### Installation
```bash
cd frontend
npm install
```

### Environment Variables
Create a `.env.local` file in the `frontend` directory with:
```
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production
```bash
npm run build
npm start
```

## Deploying to Vercel

### Configuration Steps
1. Import your GitHub repository to Vercel
2. Configure the following settings in your Vercel project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** Uses `npm install --legacy-peer-deps` (configured via vercel.json)

3. Add all environment variables in Vercel Dashboard under Settings → Environment Variables:
   - `MONGODB_URI`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `OPENAI_API_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

4. Deploy!

### Important Notes
- The project uses a monorepo structure with the Next.js app in the `frontend` directory
- The `vercel.json` at the root configures the install command to use `--legacy-peer-deps` flag
- Make sure to set the **Root Directory to `frontend`** in Vercel settings

## Team
- Tan Zhi Wei
- Edwina Hon
- Angel Phoon

