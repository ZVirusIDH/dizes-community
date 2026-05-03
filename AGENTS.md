# Dizes Project Agents & Protocol

## 🚀 Repositories
- **Web Portal (Community):** [https://github.com/ZVirusIDH/dizes-community](https://github.com/ZVirusIDH/dizes-community) (Public)
- **Android App (Core):** [https://github.com/ZVirusIDH/Dizes-Android](https://github.com/ZVirusIDH/Dizes-Android) (Private)

## 🌐 Deployment Protocol (Web)
1. **GitHub Sync:** Every push to the `main` branch of `dizes-community` triggers an automatic deployment to Vercel.
2. **Production URL:** [https://dizes-community.vercel.app](https://dizes-community.vercel.app)
3. **Environment Variables:** Must be kept in sync between Vercel and Supabase.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Supabase Config:** 
   - Ensure "Site URL" in Auth settings is always `https://dizes-community.vercel.app`.

5. **Custom Domain Migration (Live):**
   - Domain: `dizes.zetavirus.com`
   - CNAME: `dizes` -> `84e85453863e2b7e.vercel-dns-017.com.`
   - Status: **Live & Propagated**. Main production URL.

## 📱 Android Build Protocol
1. **Docker Environment:** All production builds (v1.13+) must be generated using the Docker-based build environment.
2. **Push to Private:** Always push updates to `ZVirusIDH/Dizes-Android`.
3. **Artifacts:** Store generated APKs in the root of the project for distribution.

## 🛠️ Session Restoration Protocol
In case of session loss, the agent should:
1. Verify Supabase connection using `.env.local`.
2. Check Vercel deployment status at `zvirusidhs-projects/dizes-community`.
3. Resume from the last commit on GitHub.
4. Master Admin: `zvirus@gmail.com`.
