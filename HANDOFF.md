# Martin's Door Is Open — Handoff (mdostore.com)

> Handoff dump for continuing this project with Claude Code on another machine.
> Last updated: 2026-05-22. Keep this file OUT of the public repo (it lists internal IDs).

---

## 1. What this is

A deliberately absurd, satirical e‑commerce one‑pager. Snacks, stationery and PG‑13 energy drinks.

- **Name:** Martin's Door Is Open
- **Slogan:** *we live. we love. we lie.*
- **Tone:** corner‑store-meets-confession-booth, dry humor. Keep it.
- **Products (5):** Red Bull (PG‑13), Tic Tac "Mogu Mogu Rip‑Off", Pink Lady Apples, Peppa Pig plush, Kinder Eggs (out of stock).
- **Reviews from:** Denis Spivakov, Richard Han, Alex Anurov, Viggo Biancini, Cailte Scully.
- **Careers:** CEO (marked *out of stock*), Seller, Marker.
- **Contact:** buy@mdostore.com + WhatsApp ("if Martin added you").

---

## 2. Stack & infrastructure

Pure static site. No framework, no build step. Vanilla HTML/CSS/JS.

| Thing | Value |
|---|---|
| Files | `index.html`, `product.html` (that's it) |
| Repo | `github.com/bazileuskas/mdostore`, branch `main` |
| Host | Render **Static Site**, name `mdostore`, service id `srv-d85mh8btqb8s73fc7uvg` |
| Render URL | https://mdostore.onrender.com |
| Build command | *(none)* |
| Publish dir | `.` (repo root) |
| Auto‑deploy | ON — every push to `main` redeploys |
| Domain | `mdostore.com` (registrar: GoDaddy) |
| Form backend | FormSubmit.co (free, no account) |
| Order email | buy@mdostore.com |

### DNS (GoDaddy → Render)
- `A` `@` → `216.24.57.1`  (Render apex IP)
- `CNAME` `www` → `mdostore.onrender.com`  (www redirects to apex, Render handles it)
- `NS` ns77/ns78.domaincontrol.com — GoDaddy default, **don't touch**
- SSL: Let's Encrypt, auto via Render. `www` issued; apex was finishing — verify it shows **Certificate Issued** in Render → Settings → Custom Domains.

---

## 3. Architecture / how the code is laid out

### index.html
Static page. Sections in order: promo bar → sticky header (nav + Bag button) → hero → trust bar → **shop grid** (5 `<a class="card" href="product.html?id=X">`, each with an `Add` button carrying `data-id`) → **reviews** (5 testimonials + a `data-review` "Leave a review" button) → careers (CEO `.oos`, Seller, Marker) → contact (`mailto:buy@mdostore.com` card + WhatsApp) → footer → **one inline `<script>` = the shared cart+reviews module**.

### product.html
Dynamic detail page. Two inline `<script>`s:
1. **The same shared cart+reviews module** (defines `window.MDOCart`, `window.MDOReview`). Must load first.
2. A `PRODUCTS` object (rich data: price, strike, img, thumbs, rating, reviewCount, paragraphs, bullets, reviews, stock) + `render()` that reads `?id=` and builds gallery, qty stepper, add‑to‑bag, perks, description, per‑product reviews, related products. `?id=` values: `redbull`, `tictac`, `apple`, `peppa`, `kinder`. Bad/missing id → 404 card.

### ⚠️ The cart+reviews module is DUPLICATED (inlined) in BOTH files
Kept identical on purpose so the site stays self‑contained (2‑file deploy). **If you change cart or review logic, change it in BOTH `index.html` and `product.html`.** A future refactor could pull it into a shared `mdo.js` and `<script src>` it (cleaner, but then it's 3 files to deploy).

---

## 4. Cart

- State: `localStorage["mdo_cart"]` = JSON `{ "redbull": 2, "apple": 3 }`.
- The module has a minimal `CATALOG` (id, name, price, img, `oos` flag for kinder).
  **⚠️ Two sources of product data:** module `CATALOG` *and* `product.html`'s `PRODUCTS`. Keep prices/names in sync between them.
- Bag button (`.bag`) opens a right‑side slide‑out drawer: line items, `− qty +` steppers, remove, subtotal, "$X to free delivery" note (threshold $19.99), checkout form (Name, Contact, Note).
- **Order send → FormSubmit AJAX:** `POST https://formsubmit.co/ajax/buy@mdostore.com` (JSON, `_captcha:"false"`, `_template:"table"`). Stays on page; on success clears cart and shows an "Order sent" state. No file uploads (none needed).

## 5. Reviews

- "Leave a review" button: on index (reviews section) and on every product page ("Review this product", prefills the product).
- Modal is a **real `<form>` multipart POST** → `https://formsubmit.co/buy@mdostore.com`, `enctype=multipart/form-data`. Fields: `Name`, `Rating` (hidden input set by clickable stars), `Product` (select), `Review` (textarea), `attachment` (file input, `multiple`). Hidden: `_subject`, `_template=table`, `_captcha=false`, `_next=https://mdostore.com/?review=sent`, honeypot `_honey`.
- **Photos auto‑attach** to the email (up to 10MB total) — this is why reviews use multipart, not AJAX (FormSubmit AJAX can't carry files).
- After submit the browser hits FormSubmit then redirects to `?review=sent`; the module shows a "Review received" banner.
- **Reviews are emailed for moderation — they do NOT auto‑publish on the site.** To put a review on the site, hand‑edit the testimonials in `index.html` (the `.r-grid` block) or `PRODUCTS[id].reviews` in `product.html`.

---

## 6. Email (buy@mdostore.com)

- Free Gmail can't host a domain address. Plan in progress: **email forwarding** so `buy@mdostore.com` lands in a personal inbox.
  - GoDaddy forwarding if available, else **ImprovMX** (free): set `buy@mdostore.com → your_personal@gmail` and add their two `MX` records in GoDaddy.
  - MX records are mail‑only; they do **not** affect the website's A/CNAME. Safe to add.
- **FormSubmit activation (one‑time, required):** the FIRST form submission to `buy@mdostore.com` triggers a confirmation email from FormSubmit. Click that link ONCE; after that all orders/reviews are delivered. So email forwarding must be working first.
- **Optional anti‑spam:** after activation FormSubmit gives a random alias string. Replace `buy@mdostore.com` in the form `action` and the `ajax/` URL with that alias to hide the real address from bots. (Right now the raw email is visible in page source.)

---

## 7. STATUS — read this

- ✅ **v1 (basic site)** is LIVE on mdostore.com / onrender.com.
- ✅ **v2 (cart drawer + reviews + FormSubmit + email→buy@)** is **complete and tested locally**, JS syntax‑checked.
- ❗ **v2 is NOT in GitHub yet.** It exists only in the local working folder on the *current* computer. A fresh `git clone` will give you **v1**, without cart/reviews.

### Therefore, before working on the other machine, do ONE of:
1. **Deploy v2 first (recommended):** push the current `index.html` + `product.html` to `main`. Then the other machine's clone is complete. (Ask Claude on the current machine to do this via the browser/GitHub, or do it yourself.)
2. **Carry the files:** copy the local `index.html` + `product.html` to the other machine and commit them there.

---

## 8. TODO / next steps (priority order)

1. **Deploy v2** to `bazileuskas/mdostore` `main` → Render auto‑builds (~1–2 min).
2. **Finish buy@mdostore.com forwarding** (GoDaddy/ImprovMX) and confirm apex SSL = *Certificate Issued* in Render.
3. **Activate FormSubmit:** submit one test order + one test review, then click the FormSubmit confirmation link in the buy@ inbox.
4. **Test end‑to‑end:** add to cart → checkout → email arrives; leave a review with a photo → email arrives with the image attached.
5. *(optional)* Swap FormSubmit raw email → random alias (anti‑spam).
6. *(optional)* Replace placeholder product images. Right now they're random stock photos from `loremflickr.com` (with hand‑drawn inline `<svg>` fallbacks via `onerror`). Real product shots go in: the grid `<img src>` in `index.html` AND `PRODUCTS[id].img`/`.thumbs` + `CATALOG[id].img` (module) — keep all in sync.

### Known limitations / gotchas
- Cart/review JS is duplicated across both HTML files — edit both.
- Two product‑data sources (module `CATALOG` + `PRODUCTS`) — keep in sync.
- Reviews are email‑only (no DB, no auto‑publish on site).
- Multiple photos go through one `multiple` file input; FormSubmit may attach all or just the first — verify on the first real test, and if needed split into separate `attachment`, `attachment2`… inputs.
- `_next` redirect points at `https://mdostore.com/?review=sent`; if you test on onrender.com or `file://`, the review submit will bounce you to the live domain. Expected.

---

## 9. Working with Claude Code on the other machine

```bash
git clone https://github.com/bazileuskas/mdostore.git
cd mdostore
# (make sure v2 is in here — see §7)
python3 -m http.server 8080   # then open http://localhost:8080
```

- No build, no deps. Edit HTML, refresh browser.
- Deploy = `git add -A && git commit -m "..." && git push` → Render rebuilds `main` automatically.
- Drop this file (or a sanitized version) in the repo as `CLAUDE.md` if you want Claude Code to auto‑load project context — but strip the service id / email‑routing notes first if the repo is public.

## 10. Voice / style note for whoever continues
Keep the writing dry, a little unhinged, never corporate. "We live, we love, we lie." Kinder Eggs stay sold out — it's a bit. CEO stays *out of stock* — also a bit.
