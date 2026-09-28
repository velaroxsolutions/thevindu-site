import os, re, shutil

P   = "/home/claude/site/parts"
OUT = "/home/claude/site/build"
os.makedirs(OUT, exist_ok=True)

CSS = open(f"{P}/core.css").read()
JS  = open(f"{P}/core.js").read()

# --- parse the bodies file (simple "key: |" block format) ---
raw = open(f"{P}/bodies.yaml").read()
bodies, key, buf = {}, None, []
for line in raw.split("\n"):
    m = re.match(r"^(\w+): \|\s*$", line)
    if m:
        if key: bodies[key] = "\n".join(buf).strip("\n")
        key, buf = m.group(1), []
    elif key is not None:
        if line.startswith("//"):            # comment between blocks
            if line.strip().startswith("// ----------"):
                continue
        buf.append(line[2:] if line.startswith("  ") else line)
if key: bodies[key] = "\n".join(buf).strip("\n")
print("parsed bodies:", ", ".join(bodies))

NAV = [("work.html","Work"),("about.html","About"),("library.html","Library")]

def shell(title, desc, body, active="", lanes=True, footer=True, contact=False):
    nav = "".join(
        f'<a href="{h}"{" aria-current=\'page\'" if h==active else ""}>{t}</a>'
        for h,t in NAV)
    lanes_html = """
      <div class="lanes" role="group" aria-label="Filter by lane">
        <button data-lane="all" aria-pressed="true">All</button>
        <button data-lane="build" aria-pressed="false">Build</button>
        <button data-lane="study" aria-pressed="false">Study</button>
      </div>""" if lanes else ""

    contact_html = """
  <div class="contact" id="contact" data-sec="contact" data-secname="Contact">
    <span class="lbl">Get in touch</span><br>
    <a class="mail" id="mail" href="mailto:REPLACE@WITH-YOUR-EMAIL.com" data-anim>[ your email here ]</a>
    <button class="copy" id="copybtn">Copy</button>
    <div class="quick" style="margin-top:22px">
      <a href="https://github.com/NitroSkyliner" target="_blank" rel="noopener">GitHub &#8599;</a>
      <a href="https://www.linkedin.com/in/thevindu-nagasinghe-9ba2a4342" target="_blank" rel="noopener">LinkedIn &#8599;</a>
      <a href="cv.html">R&eacute;sum&eacute;</a>
    </div>
    <p class="avail">Open to interesting work &mdash; internships, research, or anything where I'd
      be building. <a href="cv.html">R&eacute;sum&eacute; here</a>.</p>
  </div>""" if contact else ""

    footer_html = """
  <footer>
    <span class="lbl">Thevindu Nagasinghe &middot; Edmonton, Alberta</span>
    <span class="lbl">Built by hand</span>
  </footer>""" if footer else ""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@112,600;112,700;112,800&family=IBM+Plex+Mono:wght@400;500&family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet">
<style>
{CSS}
</style>
</head>
<body data-filter="all">

<a class="skip" href="#main">Skip to content</a>

<aside class="rail" aria-hidden="true">
  <a class="rail-mark" href="index.html">
    <svg viewBox="0 0 32 32" width="22" height="22"><circle cx="10" cy="22" r="7" fill="#D91A72"/><circle cx="22" cy="10" r="7" fill="#2B4CE8"/></svg>
  </a>
  <div class="rail-scale" id="railscale"><div id="railfill"></div></div>
  <div class="rail-read">EDMONTON <u id="railtime">&mdash;</u></div>
  <div class="rail-pct" id="railpct">00%</div>
</aside>

<div class="top">
  <div class="w top-in">
    <a class="brand" href="index.html">
      <svg viewBox="0 0 32 32" width="21" height="21" aria-hidden="true"><circle cx="10" cy="22" r="7" fill="#D91A72"/><circle cx="22" cy="10" r="7" fill="#2B4CE8"/></svg>
      <span>THEV</span>
    </a>
    <nav class="main">{nav}</nav>
    <div class="top-right">{lanes_html}
      <button class="kbd" id="palbtn">&#8984;K</button>
      <a class="cvlink" href="cv.html">R&eacute;sum&eacute;</a>
    </div>
  </div>
</div>

<main id="main" class="w">
{body}
{contact_html}
{footer_html}
</main>

<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Photo">
  <button class="lb-x">ESC &times;</button>
  <div class="lb-in">
    <div class="lb-img">photo</div>
    <div class="lb-cap"><span id="lbcap"></span><span class="lbl" id="lbmeta"></span></div>
  </div>
</div>

<div class="pal" id="pal" role="dialog" aria-modal="true" aria-label="Command palette">
  <div class="pal-box">
    <input id="palinput" type="text" placeholder="Jump to&hellip;" aria-label="Search commands">
    <div class="pal-list" id="pallist"></div>
  </div>
</div>

<script>
{JS}
</script>
</body>
</html>
"""

PAGES = [
 ("index.html","Thevindu Nagasinghe",
  "I ship software under Velarox and study how machines represent meaning. Computer engineering at the University of Alberta.",
  "home","",True,True),
 ("work.html","Work &mdash; Thevindu Nagasinghe",
  "Three products under Velarox: Aperis, Reflct, and Cadence.",
  "work","work.html",True,True),
 ("work-aperis.html","Aperis &mdash; Thevindu Nagasinghe",
  "An appearance-blind dating app that matches on a weighted five-dimension compatibility score.",
  "aperis","work.html",False,True),
 ("about.html","About &mdash; Thevindu Nagasinghe",
  "Computer engineering student in Edmonton. I build software under Velarox.",
  "about","about.html",True,True),
 ("library.html","Library &mdash; Thevindu Nagasinghe",
  "Templates, course summaries, and book notes. Free, no email required.",
  "library","library.html",True,True),
 ("library-books.html","Books &mdash; Thevindu Nagasinghe",
  "What I've read and what I kept from it.",
  "books","library.html",False,True),
 ("library-courses.html","Course summaries &mdash; Thevindu Nagasinghe",
  "My lecture notes, condensed into concept sheets. Free.",
  "courses","library.html",False,True),
 ("library-templates.html","Templates &mdash; Thevindu Nagasinghe",
  "Starting points for software, AI, and content work.",
  "templates","library.html",False,True),
 ("cv.html","R&eacute;sum&eacute; &mdash; Thevindu Nagasinghe",
  "Experience, projects, skills, and education.",
  "cv","",False,False),
 ("404.html","Not found &mdash; Thevindu Nagasinghe",
  "Page not found.",
  "nf","",False,False),
]

for fname, title, desc, bkey, active, lanes, contact in PAGES:
    html = shell(title, desc, bodies[bkey], active=active,
                 lanes=lanes, footer=True, contact=contact)
    open(os.path.join(OUT, fname), "w").write(html)
    print("built", fname, len(html)//1024, "kb")

# robots
open(os.path.join(OUT,"robots.txt"),"w").write("User-agent: *\nAllow: /\n")
print("\ndone.")
