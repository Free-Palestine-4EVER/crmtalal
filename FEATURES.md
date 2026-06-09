# Edarah CRM — 300 Features

A complete bilingual (Arabic RTL / English LTR) platform for **Edarah Real Estate Valuation**: public website + CRM + PWA, on Next.js 16 + Firebase + OneSignal.

---

## Brand & Design System (1–18)
1. Authentic gold-on-maroon calligraphy logo extracted from the company artwork
2. Exact brand maroon `#72142F` sampled from the official logo
3. Antique-gold accent ramp (`gold-200…800`) tuned to the wordmark
4. Cool charcoal "ink" surface scale (`ink-950…500`)
5. Cream/ivory text scale for maroon surfaces
6. Steel-blue secondary palette drawn from the architectural imagery
7. Semantic tokens (positive / caution / critical / info)
8. Transparent logo variants: official (white+gold), maroon, charcoal
9. App icons in every size (192, 512, maskable 192/512, apple-touch)
10. RGBA favicon generated from the real site icon
11. Tailwind v4 CSS-token theme (no JS config)
12. Custom utilities: `.bg-brand`, `.glow-gold`, `.glow-maroon`, `.glass`, `.text-gradient-gold`, `.hairline`
13. Topographic contour motif component echoing the profile artwork
14. Film-grain + radial-glow textures
15. Editorial display serif (Cormorant) for Latin headings + Plex Arabic for Arabic
16. Tabular-figure styling for all financial data
17. Premium dark theme throughout with gold hairlines
18. Fully tokenised — re-skinnable from one CSS file

## Bilingual / Internationalisation (19–34)
19. Arabic + English across the entire app (UI + content)
20. Automatic RTL/LTR direction switching on `<html>`
21. Dedicated Arabic typeface with adjusted line-height
22. Locale persisted via cookie + localStorage
23. Server-side locale read for flash-free first paint
24. One-tap language toggle in nav, topbar, auth, settings
25. Typed dictionary with English ↔ Arabic parity enforced by the compiler
26. `L({ar,en})` helper for localised content objects
27. Logical CSS properties everywhere (mirrors perfectly in RTL)
28. Localised dates via `date-fns` Arabic/English locales
29. Localised currency (SAR) & number formatting (`ar-SA` / `en-US`)
30. Localised relative time ("2 hours ago" / "منذ ساعتين")
31. Bilingual notification titles & bodies stored per record
32. Bilingual server-generated event templates with interpolation
33. Arabic-first defaults (Saudi company) with English toggle
34. RTL-aware drawers, chevrons, sliders, kanban

## Public Website (35–54)
35. Cinematic hero with brand gradient, glow & topographic motif
36. Bilingual headline with gold-gradient accent word
37. Animated stat counters (100k+ hours, 100+ clients, since 2012)
38. Sticky nav that transitions on scroll
39. Full-screen mobile menu with staggered animation
40. Services section — all 5 service categories with icons & checklists
41. 6-step process timeline (matching edarah.sa)
42. Standards section (TAQEEM, IVS, IVSC, RICS)
43. Geographic reach (KSA + UAE/Kuwait/Bahrain/Turkey/Europe)
44. FAQ accordion with animated expand
45. Contact strip (phone, WhatsApp, email, address)
46. Call-to-action band linking to the portal
47. Rich footer with quick links, contact, social, accreditation badge
48. WhatsApp deep-link (`wa.me`) & click-to-call
49. Scroll-reveal animations with reduced-motion support
50. SEO metadata, Open Graph, keywords (AR+EN)
51. Responsive across mobile → desktop
52. Anchored single-page navigation
53. "Request a valuation" CTA funnels to registration
54. Accessible focus states & semantic markup

## Authentication & Access Control (55–76)
55. Email/password sign-in
56. Account registration (name, email, phone, company, password)
57. Continue-with-Google sign-in
58. Forgot/reset password via email
59. Password show/hide toggle
60. Client-side validation (min length, match, required)
61. Firebase error-code → localised message mapping
62. Three roles: Client, Employee (Valuer), Admin
63. Server-side profile bootstrapping on registration
64. Admin bootstrap by email allow-list (env)
65. Role-based route protection on the portal
66. Auto-redirect by auth state (in/out)
67. Realtime profile subscription (role changes apply live)
68. ID-token-authenticated API calls
69. Server-side token verification on every mutation
70. Active/inactive account enforcement
71. Graceful "not configured" state if Firebase keys are missing
72. Session-aware nav (portal vs. public)
73. Secure sign-out across providers
74. "Back to website" escape hatch on auth pages
75. Premium auth shell with brand backdrop
76. OneSignal identity bound to the Firebase UID on login/logout

## Portal Shell & Navigation (77–92)
77. Role-aware sidebar (each role sees a different app)
78. Grouped navigation (Main / CRM / Insights / Manage)
79. Active-route highlighting with gold marker
80. Collapsible mobile drawer with spring animation
81. Sticky top bar with backdrop blur
82. Global search box (routes to filtered requests)
83. Notifications bell with unread badge
84. Rich notification popover (mark-read, deep-link)
85. User menu (avatar, name, role, profile/settings/sign-out)
86. Push opt-in chip in the top bar
87. Language toggle in the top bar
88. Avatar with initials fallback & gold ring
89. Responsive max-width content area
90. Consistent `PageHeader` with icon, subtitle, actions
91. Reusable empty / loading / skeleton states
92. Mobile-first, app-like layout

## Dashboard (93–106)
93. Time-aware greeting (morning/afternoon/evening)
94. Role-specific welcome messaging
95. Client KPIs: total / in-progress / completed / pending
96. Employee KPIs: assigned active / completed / tasks awaiting you
97. Admin KPIs: total / awaiting assignment / active / completed
98. Admin second row: clients, valuers, leads, open tasks
99. Live KPI computation from realtime data
100. Recent requests feed
101. Quick "new request" action (client/admin)
102. Empty-state onboarding for first request
103. StatCards with tone, icon, optional trend
104. One-glance pipeline health for admins
105. Deep-links from every card
106. Skeleton loading for all widgets

## Valuation Requests & Workflow (107–140)
107. Client self-service valuation request creation
108. 14 property types (land, villa, palace, tower, warehouse, REIT…)
109. 11 valuation purposes (financing, litigation, inheritance, tax…)
110. Saudi region picker (13 regions + outside-KSA)
111. City / district / address fields
112. Area capture (m²)
113. Priority levels (normal / high / urgent)
114. Free-text description & notes
115. Multi-file document upload at request time
116. Auto-generated reference codes (`EV-2026-0001`)
117. Atomic sequence counter (transaction-safe codes)
118. 8-stage status workflow (submitted → completed)
119. 3 macro-stages (Pre-Eval / Execution / Post-Eval)
120. Visual stage-progress stepper
121. Terminal states (rejected / cancelled)
122. Status badges with semantic tones
123. Requests list with search + status filter + counts
124. Role-scoped lists (client = own, employee = assigned, admin = all)
125. Rich request detail page
126. Property-details panel
127. Assign request to a valuer (admin)
128. Auto-status bump to "assigned" on assignment
129. Change status (staff)
130. Set valuation method (market/cost/income)
131. Set estimated value (SAR)
132. Set service fee (admin only)
133. Internal notes / file log (staff)
134. Append-only audit timeline (every action recorded)
135. Localised timeline entries with actor + time
136. Document upload by client or staff (post-submit)
137. Report upload (draft / final / completion certificate)
138. Auto-status → "report ready" on final report
139. Document & report download with tokenised URLs
140. Priority & method shown on cards/detail

## Documents, Reports & Messaging (141–154)
141. Drag-and-drop file uploader
142. Multi-file concurrent upload with progress %
143. File-type & size validation (Storage rules)
144. Immediate attach-on-upload to a request
145. Removable file chips
146. Document list with uploader attribution
147. Deliverables panel (reports & certificates)
148. Report-type tagging
149. Per-request threaded messaging (client ↔ valuer ↔ admin)
150. Realtime chat with auto-scroll
151. Sender avatars & timestamps
152. Own-vs-other message styling
153. Enter-to-send
154. Message notifications to the other party

## Notifications & Push (155–172)
155. In-app notification system (Firestore-backed, source of truth)
156. OneSignal web-push integration (v16 SDK)
157. Combined service worker (push + offline in one)
158. Push targeted by external ID = Firebase UID
159. Bilingual push headings & contents
160. Notification on new request → all admins
161. Confirmation notification → client on submit
162. Notification on assignment → valuer + client
163. Notification on status change → client
164. Notification on report ready → client
165. Notification on completion → client (certificate available)
166. Notification on new message → counterpart
167. Notification on document upload → counterpart
168. Notification on new client registration → admins
169. Notification on fee set → client
170. Unread badge + mark-all-read + per-item read
171. Full notifications page with unread filter
172. Best-effort push (degrades gracefully without keys)

## Leads (173–186)
173. Lead capture with status pipeline (new → converted/lost)
174. Lead sources (website, WhatsApp, phone, referral, campaign, manual)
175. Lead fields: name, phone, email, property type, purpose, region, message
176. Add/edit lead modal
177. Search & status filter with live counts
178. Status badges with semantic tones
179. Lead detail drawer
180. Change lead status inline
181. **Convert lead → client contact** (one action)
182. Assign lead to staff
183. Internal notes
184. Admin-only delete with confirmation
185. Responsive table ↔ cards
186. Realtime list updates

## Contacts (187–198)
187. Contact directory (clients, partners, leads, vendors)
188. Contact types with badges
189. Add/edit contact modal
190. Fields: name, email, phone, company, job title, type, notes
191. Avatar initials
192. Search + type filter
193. Contact detail drawer
194. Quick tel:/mailto: actions
195. Admin-only delete
196. Tag support
197. Realtime updates
198. RTL-correct contact cards

## Companies / Accounts (199–210)
199. Company directory (client, partner, bank, developer, gov, fund)
200. Company-type badges
201. Add/edit company modal
202. Fields: name, type, sector, website, phone, email, city, notes
203. Website link normalisation
204. Search across name/sector/city/email
205. Type filter
206. Company detail drawer
207. Admin-only delete
208. Realtime updates
209. Responsive table ↔ cards
210. Pre-seeded with the firm's real partner list (reference)

## Deals / Pipeline (211–224)
211. Kanban pipeline board (6 stages)
212. Stage columns: lead → qualified → proposal → negotiation → won/lost
213. Per-column deal count
214. Per-column summed value (SAR)
215. Deal cards (title, client, value, owner, close date)
216. Move deal across stages via menu
217. Won column tinted positive, lost tinted muted
218. Add/edit deal modal
219. Expected close date
220. Owner auto-assignment
221. Horizontal-scroll board (RTL-aware)
222. Admin-only delete
223. Animated card transitions
224. Realtime pipeline updates

## Tasks (225–238)
225. Task management with status (todo / in-progress / done / cancelled)
226. Priority levels with badges
227. Due dates with overdue + due-today highlighting
228. One-tap complete toggle (stamps completedAt)
229. Assign tasks to staff
230. Assignee avatars
231. Link tasks to a request code
232. Status filter with counts
233. "Assigned to me" toggle
234. Add/edit task modal
235. Smart sort (open by due date, done last)
236. Task-assignment notifications
237. Admin-only delete
238. Realtime updates

## Calendar (239–250)
239. Month-grid calendar
240. Prev / next / today navigation (RTL-mirrored)
241. Localised month & weekday headers
242. Today's cell highlighted
243. Event types (site visit, meeting, deadline, call, other)
244. Colour-coded event chips
245. Overflow "+N more" per day
246. Click day → list + add event (prefilled date)
247. Click event → details modal
248. Add/edit event with start/end datetime
249. Event location, client, assignee, notes
250. Realtime event updates

## Invoices & Billing (251–266)
251. Invoice list with status pipeline
252. Auto invoice numbers (`INV-2026-0001`)
253. Statuses: draft / sent / paid / overdue / cancelled
254. Outstanding / paid / draft summary cards
255. Full invoice builder with dynamic line items
256. Per-line amount auto-calc (qty × unit price)
257. Live subtotal / VAT / total
258. Configurable VAT rate (default 15%)
259. SAR currency formatting
260. Link invoice to client & request
261. Issue & due dates
262. Mark as sent / paid (stamps paidAt)
263. Invoice detail drawer with item table
264. Print-friendly invoice (window.print)
265. Admin-only delete
266. Status filter + search

## Analytics (267–278)
267. Admin analytics dashboard
268. Revenue, portfolio value, conversion KPIs
269. Requests-over-time area chart (8-month window)
270. Requests-by-status bar chart
271. Requests-by-property-type donut
272. Pipeline-by-stage chart (value or count)
273. Top valuers by completed work
274. Themed dark charts (gold/maroon/steel palette)
275. Responsive charts (recharts)
276. Localised axes & tooltips
277. Graceful empty-data handling
278. Live aggregation from realtime data

## Activity, Clients & Team (279–292)
279. Global activity log (audit feed)
280. Actor, action, entity, time per entry
281. Entity-type filter
282. Clients directory (admin) with request counts
283. Client detail drawer + their requests
284. Quick contact (call / email / WhatsApp)
285. Team management (admin)
286. **Create valuer accounts** (server-side, admin SDK)
287. Activate / deactivate users
288. Grant / revoke admin
289. Self-action guards (can't demote yourself)
290. Per-valuer workload (active vs completed)
291. Role badges
292. Realtime team & client lists

## Profile, Settings & PWA (293–300)
293. Editable profile (name, phone, company)
294. Language preference in settings
295. Push-notification enable/status (granted/blocked)
296. Change password (with re-auth handling)
297. Installable PWA (web manifest + icons)
298. Offline support with branded offline page
299. Custom install prompt banner
300. Stale-while-revalidate asset caching + network-first navigation

---

### Architecture highlights
- **Reads** stream live via the Firebase client SDK; **all writes** flow through authenticated Next.js API routes using the Admin SDK — so every state change is validated, audited, and fires notifications.
- Generic `/api/crm` engine powers 7 CRM entities with one secure, audited endpoint.
- Firestore security rules + composite indexes + Storage rules included.
- Whole platform builds clean on **Next.js 16 (Turbopack)** with **zero type errors**.
