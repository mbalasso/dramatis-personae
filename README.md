# Dramatis Personae

> Show NPC portraits on player phones during tabletop RPG sessions.

The DM runs a lightweight web server on their laptop. Players open a URL on their phones (or an old phone dedicated to this task). When the DM selects an NPC, the portrait appears on all connected devices with a cinematic reveal animation — no apps, no accounts, no internet required.

*The name is a nod to [Sly Flourish](https://slyflourish.com/)'s approach to bringing NPCs to life at the table.*

---

## How It Works

```
DM laptop (server + control panel)
        │
        └── Wi-Fi (local network)
                │
                ├── Player phone 1  →  portrait display
                ├── Player phone 2  →  portrait display
                └── Player phone N  →  portrait display
```

1. The DM starts the server on their laptop
2. Players open the **Player URL** on their phones (same Wi-Fi network)
3. The DM picks an NPC from the control panel — the portrait appears on all phones simultaneously
4. The DM can dismiss the portrait or switch to another NPC at any time

---

## Installation

Requires [Node.js](https://nodejs.org/) (v18 or later).

```bash
# Clone or download the project, then:
npm install
```

---

## Starting the Server

```bash
npm start
```

The server prints the two relevant URLs:

```
  ⚔️  Dramatis Personae
  ─────────────────────
  DM Panel:     http://localhost:3000/dm
  Player View:  http://192.168.1.42:3000/players
  Portraits:    4 loaded from disk
```

- **DM Panel** — open on the DM's laptop
- **Player View** — share this URL with players (or have them scan a QR code of it)

The server also reports how many portraits were found and loaded from disk at startup.

---

## DM Panel

### Adding an NPC

Fill in the NPC name, then provide a portrait in one of two ways:

| Method | How |
|--------|-----|
| **File picker** | Click **📎 Select a portrait from disk** and choose an image |
| **Clipboard paste** | Copy any image (screenshot, browser drag, etc.) and press **Ctrl+V** anywhere on the page |

A thumbnail preview confirms the selected image. Click **Add** to save the NPC.

### Managing NPCs

- **Click a card** → the portrait is displayed on all player screens
- **Click Hide Portrait** → dismisses the current portrait
- **Click ✕ on a card** → permanently removes the NPC and deletes its file from disk

Cards are displayed 5 per row, sorted alphabetically by name. The active NPC is highlighted with a gold border and a green indicator dot.

---

## Player View

- Dark ambient screen with an idle animation while waiting
- When the DM activates an NPC, the portrait fades in with a cinematic frame and gold border
- The NPC name appears below the portrait
- **Fullscreen button** (bottom-right corner) — tap to go fullscreen; it auto-fades after a few seconds and reappears on touch
- On Android, the browser address bar automatically matches the dark background color (no HTTPS required)
- On iOS, save the page to the Home Screen for a full-screen experience

The view polls the server every 2 seconds — no WebSockets needed.

---

## Adding Portraits Without the App

Portraits can be copied directly into `public/portraits/` without using the upload form. The filename must follow this convention:

```
<numeric-code>-<name>.<ext>
```

Examples:
```
01-Finnik.png
42-Archmage Vyndrel.jpg
100-Avar'keth.webp
9999-The Shadow.png
```

- The **numeric code** can be any sequence of digits (used for ordering; lower numbers appear first if names are equal)
- The **name** is displayed on the DM panel card and the player screen
- Supported formats: JPEG, PNG, GIF, WebP (max 10 MB each)

On the next server start, all matching files are loaded automatically. Files uploaded via the DM panel are also saved with this naming convention, so they survive restarts.

---

## Technical Notes

- **Stack**: Node.js + Express, vanilla JS frontend, no build step
- **Persistence**: portraits are stored as files in `public/portraits/`; the NPC list is rebuilt from disk on each startup, so portraits survive restarts
- **Active NPC**: the currently displayed portrait is held in memory and resets on server restart
- **Security**: no authentication — designed for trusted local networks only
- **Port**: defaults to `3000`, override with the `PORT` environment variable

*Built with the help of [Claude](https://claude.ai) by Anthropic.*

---

## Project Structure

```
dramatis-personae/
├── public/
│   ├── dm.html          # DM control panel
│   ├── players.html     # Player portrait display
│   └── portraits/       # Uploaded and manually added portrait images
├── server.js            # Express server + API
└── package.json
```

---



*Built for the table. Roll initiative.*
