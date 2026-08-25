# TMB Events 🎟️📲

> Ultra-luxurious event management, RSVP tracking, dynamic QR passes, and automated WhatsApp messaging gateway for live events, galas, conferences, and exclusive gatherings.

---

## 🌟 Key Features

- **Automated WhatsApp Gateway**: Connect directly via **Meta WhatsApp Cloud API (Graph v20.0)**, **Twilio**, **UltraMsg**, **Evolution API**, or custom REST webhooks.
- **Dynamic Scannable QR Codes**: Generate high-contrast, tamper-resistant QR passes with quick door check-in scanner and audio chime verification.
- **Batch Badge & Pass Printing**: 1-click printable PDF layouts for Lanyard Badges (4×3"), Table Placecards, and Compact QR Slips.
- **VIP Guest List & RSVP Management**: Bulk CSV import, real-time RSVP status tracking, seat & table allocation.
- **Digital Ticket Wallet**: Attendees can view, download (.png), print, or add tickets directly to Google/Apple Calendar.

---

## 🚀 Quick Start & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/imjdesignagency/eventpulse.git
cd eventpulse
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port displayed in your terminal).

### 4. Build for Production
```bash
npm run build
```

---

## ⚡ Deployment to Vercel

1. Push this repository to your GitHub account.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repo.
3. Vercel automatically detects the Vite framework settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**!
