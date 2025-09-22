# Icon Files for Firefox Extension

The Firefox extension includes custom icons. Since we can't create actual PNG files here, you'll need to create or download icons.

## Required Icon Sizes:
- `icon16.png` - 16x16 pixels
- `icon32.png` - 32x32 pixels  
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## Quick Icon Creation:

### Option 1: Use the SVG Template
- Use the provided `icon128.svg` as a template
- Convert to PNG using online tools or image editors
- Resize to create all required sizes

### Option 2: Simple Colored Squares (For Testing)
Create simple colored squares in any image editor:
- Background: Firefox Orange (#FF6B00)
- Add a white music note or "♪" symbol
- Save in the required sizes

### Option 3: Download Icons
Search for "music note icon png" and download suitable icons, then:
1. Resize to required dimensions
2. Place in the `firefox-extension` folder
3. Name as `icon16.png`, `icon32.png`, etc.

## Temporary Workaround:
If you don't have icons, you can remove the icon references from `manifest.json`:

```json
{
  "browser_action": {
    "default_popup": "popup.html",
    "default_title": "Apple Music Now Playing"
  }
}
```

The extension will work without icons, just won't have a custom appearance in the toolbar.