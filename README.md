# MakeIT Inventory Client

SPA-klient byggd med Vue 3 (Vite) + Vue Router + Tailwind. Klienten använder MakeIt Inventory API för autentisering och CRUD av produkter.

## Funktioner
- Inloggning (JWT) via API
- Produkter: lista, skapa, redigera, ta bort
- Lagerhantering: öka/minska saldo tydligt från gränssnittet
- Kategorier (om aktiverat i UI): lista och koppla produkt till kategori
- Rollbaserad åtkomst (ADMIN/STAFF) beroende på API-regler

## Teknik
- Vue 3 (Vite)
- Vue Router
- Axios
- Tailwind CSS

## Installera
```bash
npm install
```

## Miljövariabler
- Skapa .env baserat på .env.example.
- Exempel: VITE_API_BASE_URL=http://localhost:3000

## Starta
```bash
npm run dev
```
Klienten körs normalt på: http://localhost:5173

## API-krav
- API:t måste vara igång och ha CORS aktiverat för klientens origin.
