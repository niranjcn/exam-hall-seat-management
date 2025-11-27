# Docker Hot-Reload Guide

## 🚀 Start with Auto-Reload (Recommended)

```powershell
docker compose watch
```

This command:
- ✅ Starts all containers
- ✅ Auto-reloads code changes (src files) instantly
- ✅ Auto-rebuilds when package.json changes
- ✅ Keeps running until you press Ctrl+C

## 📝 What Auto-Reloads:

### Without Rebuild (Instant):
- `.tsx`, `.ts`, `.jsx`, `.js` files
- `.css` files
- Any file in `src/` or `backend/` folders

### With Rebuild (Few seconds):
- `package.json` (when you add/remove dependencies)
- `Dockerfile.dev`

## 🔄 Alternative Commands

### Regular Start (Manual rebuild needed for package.json):
```powershell
docker compose up
```

### Start with Build:
```powershell
docker compose up --build
```

### Stop Containers:
```powershell
docker compose down
```

### View Logs:
```powershell
docker compose logs -f
```

### Restart Single Service:
```powershell
docker compose restart frontend
docker compose restart backend
```

## 📊 Current Setup:

- **Frontend**: Vite dev server on port 3000 (Hot Module Replacement enabled)
- **Backend**: Nodemon on port 5000 (Auto-restarts on file changes)
- **MongoDB**: Persistent data on port 27017

## 💡 Tips:

1. **First time setup**: Use `docker compose up --build` to build images
2. **Daily development**: Use `docker compose watch` for auto-reload
3. **Package changes**: Watch mode auto-rebuilds when package.json changes
4. **Clean rebuild**: Run `docker compose down` then `docker compose up --build`
