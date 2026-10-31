// Vercel serverless function. The API key lives in Vercel env vars, never in the repo.
// Uses the Groq API (OpenAI-compatible chat completions).
const PORTFOLIO = `You are the AI assistant on Utkarsh Bhaskar's portfolio website. You are a capable, friendly general-purpose assistant who also knows Utkarsh's portfolio well.

HOW TO ANSWER:
- Questions about Utkarsh (who he is, skills, education, projects, links, contact): answer using the PORTFOLIO INFO below. Never invent details about him that are not listed; if a specific detail is missing, say you don't have it and point to the Contact section or his GitHub.
- Any other question (coding help, general knowledge, concepts, advice, explanations): answer it normally and helpfully using your own knowledge.
- If a visitor asks about the projects in general terms (e.g. "explain the Python programs"), you may explain the concepts involved (factorial, Fibonacci, dictionaries, quizzes, etc.) while making clear which parts come from his portfolio.
- Keep replies clear and reasonably short. Use plain text, no markdown tables.

PORTFOLIO INFO:
ABOUT: Utkarsh Bhaskar, B.Tech Computer Science Engineering student at JECRC University, Jaipur, Rajasthan (graduating 2029). Full-stack developer. Founder of Blood.net, an emergency healthcare coordination platform for India, launching first in Rajasthan.
SKILLS: HTML, CSS, JavaScript, Python, React, Tailwind CSS, Git and GitHub, Vercel deployment, REST APIs, Cursor AI.
LINKS: GitHub https://github.com/UTRINO-UTKARSH | LinkedIn https://www.linkedin.com/in/utkarsh-bhaskar-a89678371 | Portfolio https://utrino-connect.vercel.app
PROJECTS:
1. Python Programs Collection: factorial, Fibonacci and structure-to-dictionary conversion programs, plus an updated README.
2. Messy Python Code Improvement: a messy script cleaned up with AI help (better names, structure, comments).
3. Bug Fixing Using Cursor AI: a buggy program located and corrected using Cursor AI. (Exact bug details are not listed here; if asked, say so.)
4. Interactive Quiz Application (Lecture 10): HTML/CSS/JS quiz that shows questions, checks answers and gives a score.
5. Book Reading List Application (Lecture 11): lets users add books and mark them as read; README has the deployed link.`;

module.exports = async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"POST only"});
  const key = process.env.GROQ_API_KEY;
  const configuredModel = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const model = configuredModel === "openai-gpt-oss-120b"
    ? "openai/gpt-oss-120b"
    : configuredModel;
  if(!key) return res.status(500).json({error:"Server is missing GROQ_API_KEY"});
  const { message, history = [] } = req.body || {};
  if(!message || typeof message !== "string") return res.status(400).json({error:"No message"});
  const messages = [
    {role:"system", content:PORTFOLIO},
    ...history.slice(-8).map(h=>({role:h.role==="user"?"user":"assistant", content:String(h.text).slice(0,1000)})),
    {role:"user", content:message.slice(0,500)}
  ];
  try{
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions",{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},
      body: JSON.stringify({model, messages, temperature:0.5, max_tokens:1500, ...(model.includes("gpt-oss") ? {reasoning_effort:"low"} : {})})
    });
    const d = await r.json();
    const reply = d?.choices?.[0]?.message?.content;
    if(!r.ok || !reply){ console.error("Groq error:", r.status, JSON.stringify(d)); return res.status(502).json({error:"Upstream API error: " + (d?.error?.message || "no reply")}); }
    res.status(200).json({reply});
  }catch(e){ console.error(e); res.status(502).json({error:"Could not reach AI service"}); }
}