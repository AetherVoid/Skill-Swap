# SkillSwap Malawi — Executive Summary (canonical product spec)

This document is the structured product specification for **SkillSwap Malawi: A Peer-to-Peer Skills Exchange Platform**, derived from the executive summary PDF. Implementation in this repository should follow this version.

## Context

Malawi’s youthful, low-cash economy and uneven connectivity support a **peer-based barter** model: users trade **time and expertise** instead of money, reducing cost and strengthening community. Target users include students, young professionals, farmers, and artisans. Nearly **half the population is under 16**; **~73% are under 30** (median age **~17.3**). Skills of interest include **languages, business, and agri-tech**, among others.

Connectivity reality: only **~28%** of Malawians use the internet; **~80%** are rural. The product must work on **low-end phones** (mobile-friendly web / **PWA**) and via **SMS/USSD** for users without reliable data.

## Core value propositions

1. **Cost-free knowledge** — Swap skills instead of paying cash; overcome financial barriers.
2. **Community & trust** — In-person exchange builds social capital; value hours fairly (“every hour matters”).
3. **Localized learning** — English and Chichewa; neighbors in your **district**; face-to-face swaps.
4. **Empowerment & growth** — Peer learning can improve livelihoods (e.g. farming study circles, youth enterprise).

## Target personas

| Persona | Notes |
|--------|--------|
| **Youth / students** | Large base; tutoring (languages, STEM), exam prep, livelihood skills. Example: swap math tutoring for English. |
| **Artisans & trades** | Tailors, carpenters, mechanics; need digital/business skills; **lightweight** app (limited data). |
| **Farmers & rural youth** | Agriculture-heavy; trade techniques for literacy or mobile money; **offline/USSD critical**. |
| **Urban professionals** | Teachers, nurses, SMB owners; value convenience and **verified** peers. |

**Assumptions:** Meaningful **mobile** access (~55% coverage cited in source material), low broadband, willingness to meet locally, cultural fit with community exchange (NGO/cooperative experience).

## MVP features (product)

- **Profiles** — Skills offered and wanted; categories (e.g. Agriculture, Language, Tech, Trades, Arts); bio and location.
- **Search & matchmaking** — Browse/search by skill and location; optional **requests** (“I need X, offer Y”).
- **Scheduling & communication** — In-app chat and/or SMS; reminders.
- **Time credits** — e.g. **1 credit per hour taught**, spend to learn; balance encourages reciprocity (time-bank style).
- **Ratings & reviews** — Mutual 1–5 stars + optional comments after each swap.
- **Verification** — Phone and/or sponsor / student ID; **verified badge**.
- **Disputes** — Flag failed exchanges; admin review; **escrow/hold** credits until both confirm completion where applicable.
- **Low bandwidth** — PWA with offline caching; **SMS/USSD** for core flows.
- **Localization** — English and **Chichewa** UI; local time/calendar conventions.

## User journey (high level)

Sign up / login → verify phone (or email in future) → **profile** (offered/wanted skills) → browse/search → view profile → **exchange request** → accept → **chat & schedule** → conduct session → **mark complete** → **feedback** → **earn/spend credits** → repeat. Onboarding should nudge at least one skill offered and one wanted so users see the barter loop quickly.

## Matching (algorithms)

1. **Rule-based** — Keyword match on offered vs wanted skills; **proximity first** (nearby users).
2. **Credit-based** — Match willing parties; debit/credit by hours when direct two-way skill pairing is not required, if balances allow.
3. **Swap cycles** — Short cycles (e.g. A→B→C→A) via graph search when no direct pair exists.
4. **Priority rules** — Optional boost for new users or lower credit balances; notify on posted requests.

Later: optional **AI-assisted** matching; start with a **rules engine**.

## Suggested data model (relational)

Aligns with the executive summary tables: **Users**, **Skills** (per user), **Exchanges** (two users, two skills, status, schedule), **Messages**, **Ratings**, **Verifications**; **credit balance** as field and/or **append-only ledger** for audit/disputes.

## Technology (options stated in summary)

- **Frontend:** PWA (e.g. React/Vue) or cross-platform (e.g. Flutter); offline-first.
- **Backend:** Node/Express or Python; **PostgreSQL** or MySQL; REST API.
- **SMS/USSD:** Gateway integration (local or global providers); USSD menus where available.
- **Auth:** e.g. Firebase Auth for phone verification.
- **Hosting:** Cloud (AWS/GCP/Heroku/DigitalOcean, etc.); Docker for portability.
- **Notifications:** FCM + SMS/email.

This repo’s implementation uses **React + Vite PWA**, **Node + Express + Prisma + PostgreSQL**, and pluggable SMS/USSD.

## Privacy, security, fraud

Minimal data; HTTPS; verification and escrow-style **credit holds**; moderation and dispute queues; optional hidden contact details; block/report.

## Trust & reputation

Mutual ratings, **verified badges**, escrow until completion, community/NGO **sponsorship** for new users.

## Partnerships (examples from summary)

Universities/colleges; NGOs and cooperatives (e.g. **WeEffect**, **DOT Malawi**); councils and youth/church groups; **MUSCCO** and similar networks; media; Ministry of Youth / Education alignment with **Digital Malawi**.

## Monetization (light touch)

Freemium (e.g. highlighted listings, filters); minimal transaction fees where relevant; unobtrusive sponsorships; grants/donations; optional **org-branded sub-groups**; long-term anonymized analytics for institutions.

## Legal (Malawi)

ICT/telecom compliance for SMS/USSD; privacy policy and secure storage; consumer terms; guardian consent for minors where applicable; vet third-party contracts.

## KPIs (examples)

| Metric | Example direction |
|--------|-------------------|
| User growth | e.g. **~500 registered users in 6 months** (early goal) |
| Completed exchanges | e.g. **50+ / month** in pilot |
| Retention | Users doing **more than one** exchange |
| Average rating | **≥ 4 / 5** |
| Credit circulation | Hours earned/spent |
| Response time | Request → scheduled swap |
| Geography | Districts/towns with active users |
| Partners | Active orgs onboarded (e.g. **3** NGOs/universities in year 1) |

## Rollout & timeline (2026–2027, indicative)

- **Design & prep** — User research, prototype UI/UX, backend architecture (~Q1–Q2 2026).
- **MVP development** — Core features; USSD/SMS integration; QA (mid 2026).
- **Pilot** — Local partnership; beta in a city (**e.g. Lilongwe or Mzuzu**); feedback (~late 2026).
- **Scale** — Marketing, feature expansion, broader rollout (2027).

## Estimated year-1 costs (USD, illustrative)

| Category | Range |
|----------|--------|
| Development (MVP) | **$8,000 – $12,000** |
| Server / hosting & ops | **~$1,000 / yr** |
| SMS/USSD | **~$500 / yr** |
| Marketing & outreach | **$2,000 – $3,000** |
| Community engagement | **~$1,000** |
| Monitoring & support | **~$1,000 / yr** |
| **Total (approx.)** | **$14,500 – $18,500** |

## Competitive landscape (summary)

Global apps (e.g. **SkillsSwap**, **Bartr**, **Reciproc8**, **BarterGrid**) mix direct listings, escrow/time-banks, and community focus. SkillSwap Malawi combines **local** focus, **simple matching**, **reputation**, and **credit/escrow** ideas adapted to Malawi.

## Recommended next steps

1. **Field research & anchor partners** — Interviews with students, artisans, farmers; secure a youth NGO or college for a **pilot** cohort.
2. **Prototype / MVP** — Profile → match → chat → rate; test on **low-end** devices; iterate UX.
3. **Pilot launch** — Limited geography with partners; measure KPIs; harden USSD/SMS and ops before scale.

## Source

Executive summary PDF: *SkillSwap Malawi: A Peer-to-Peer Skills Exchange Platform (Executive Summary)* — citations and links in the original PDF (e.g. DataReportal Malawi, WeEffect, app store listings) support the statistics and examples above.
