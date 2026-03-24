# LuidCorporation Marketplace

## Current State
New project with no existing application files.

## Requested Changes (Diff)

### Add
- Public landing page with hero section, product catalog grid, category filters, and CTA buttons styled with neon green (#39FF14) on white (#FFFFFF)
- User auth: registration and login portal (client role)
- Admin auth: restricted admin panel (admin role)
- Script catalog with cards (title, version, price, language, category badge, "Ver Mais" button)
- Script detail page: description, requirements, changelog, buy/download button
- Purchase/delivery system: after purchase, download link or access key released in user profile
- Admin inventory management: upload scripts (blob storage), set prices, edit descriptions
- Admin user management: view customers, purchase history, account status
- Admin financial dashboard: sales reports, top scripts
- "Meus Scripts" page for authenticated customers showing purchased scripts
- Smart redirect: clients → catalog or my scripts; admins → metrics dashboard

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Generate Motoko backend with: Script entity (id, title, description, version, price, language, category, requirements, changelog, fileKey, accessKey), User purchases, Admin operations (CRUD scripts), Purchase recording, Stats/financial reporting
2. Wire authorization component for role-based access (client/admin)
3. Wire blob-storage for script file uploads
4. Build React frontend: Landing page, Auth pages, Catalog, Product detail, My Scripts, Admin dashboard (inventory, users, financials)
5. Apply Clean Tech design: white bg, neon green accents, modern typography
