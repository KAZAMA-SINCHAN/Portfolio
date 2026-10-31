// Local dev server: serves the site AND /api/chat, so the chatbot works without Vercel.
// Run: npm run dev  ->  http://localhost:3000   (no packages to install)
const http = require("http");
const fs = require("fs");
const path = require("path");
const handler = require("./api/chat.js");

// Tiny .env loader (Node built-ins only)
try{
  fs.readFileSync(path.join(__dirname, ".env"), "utf8").split(/\r?\n/).forEach(line=>{
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if(m && !line.trim().startsWith("#") && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g,"");
  });
}catch(e){ console.warn("No .env file found. Copy .env.example to .env and add your key."); }


const TYPES = {".html":"text/html",".css":"text/css",".js":"text/javascript",".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png",".svg":"image/svg+xml",".ico":"image/x-icon"};

http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  if(url === "/api/chat"){
    let raw = "";
    req.on("data", c => raw += c);
    req.on("end", async () => {
      try{ req.body = raw ? JSON.parse(raw) : {}; }catch(e){ req.body = {}; }
      res.status = code => { res.statusCode = code; return res; };
      res.json = obj => { res.setHeader("Content-Type","application/json"); res.end(JSON.stringify(obj)); };
      try{ await handler(req, res); }catch(e){ console.error(e); res.status(500).json({error:"Server error"}); }
    });
    return;
  }
  const file = path.join(__dirname, url === "/" ? "index.html" : decodeURIComponent(url));
  if(!file.startsWith(__dirname) || file.includes(`${path.sep}api${path.sep}`) || file.endsWith(".env")){ res.statusCode = 403; return res.end("Forbidden"); }
  fs.readFile(file, (err, data) => {
    if(err){ res.statusCode = 404; return res.end("Not found"); }
    res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
    res.end(data);
  });
}).listen(process.env.PORT || 4000, () => console.log("Portfolio running at http://localhost:" + (process.env.PORT || 4000)));