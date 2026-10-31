# Utkarsh Bhaskar | Personal Portfolio

Responsive portfolio with project search, light/dark mode and an API-powered chatbot.

**Live website:** https://utkarsh-portfolio-utrino.vercel.app/

## Technologies
HTML, CSS, JavaScript, Vercel Serverless Functions, Groq API

## Features
- Sections: Home, About Me, Skills, Projects, Contact, AI Chatbot
- Five project cards with tech tags, GitHub and live links
- Search/filter by project name or technology
- Light/dark mode (remembered between visits)
- Chatbot answering from portfolio info; shows an error message if the API fails
- API key stored in Vercel environment variables, not in the code

## Run locally
1. Install Node.js 18+.
2. Add `GROQ_API_KEY=your_key` to `.env`.
3. Run `node config.js` and open http://localhost:4000 (do not open index.html directly or use Live Server; the chatbot needs this server).

## Deploy on Vercel
1. Add your photo as `assets/profile.jpg`, edit project links in `script.js` and your email in `index.html`.
2. Push to GitHub and import the repo in Vercel.
3. In Vercel > Settings > Environment Variables, add `GROQ_API_KEY`, then redeploy.