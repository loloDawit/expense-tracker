# 📸 Fastlane Screenshot Automation Guide

This guide documents the steps for preparing and framing iOS app screenshots using Fastlane’s `frameit`, including workarounds for unsupported devices like iPhone 16.

---

## 🧹 Prerequisites

- Fastlane installed (`brew install fastlane`)
- `frameit` supports only up to iPhone 15 frames — iPhone 16 screenshots require manual resizing
- `sips` (built-in on macOS) is used for image resizing
- Folder structure:

```
.
├── fastlane
│   └── screenshots
│       └── en-US
│           └── Framefile.json
├── fastlane_screenshot_guide.md
├── generate_framefile.sh
└── screenshots
    └── en-US
        ├── framed_Simulator Screenshot - iPhone 16 Pro Max - <timestamp>_framed.png
        ├── ... (other final screenshots)
        ├── Framefile.json
        ├── resize_and_rename.sh
        └── run_frameit_and_clean.sh
```

---

## ✅ Workflow Steps

### 1. **Capture Screenshots**

Take screenshots directly from the iOS Simulator using `⌘ + S`. Save them manually or retrieve them from:

```
~/Library/Developer/CoreSimulator/Devices/<device-uuid>/data/Containers/Data/Application/<app-uuid>/Documents/
```

> 💡 Recommended to rename them in order (e.g. `01.png`, `02.png`, etc.)

---

### 2. **Place Screenshots in Fastlane Folder**

Copy your screenshots to:

```bash
fastlane/screenshots/en-US/
```

---

### 3. **Resize and Rename**

Run the following script from inside the `en-US` directory to resize the screenshots and prefix them with `framed_`:

```bash
./resize_and_rename.sh
```

> 🛠 This ensures compatibility with `frameit`, which doesn’t yet support iPhone 16 resolutions.

---

### 4. **Generate Framefile.json**

Move to the root `fastlane` folder and run the Framefile generator:

```bash
cd ../../
./generate_framefile.sh
```

This creates a `Framefile.json` with metadata like:

- Title
- Subtitle
- Keyword for localization
- Frame color
- Padding

> 💡 Pro tip: This can be extended to generate AI-powered captions in future versions!

---

### 5. **Run Frameit and Clean Up Intermediate Screenshots**

From the `en-US` folder, run:

```bash
./run_frameit_and_clean.sh
```

This script:

- Runs `fastlane frameit --verbose`
- If successful, deletes all intermediate `framed_*.png` files that were created by `resize_and_rename.sh`
- Preserves final framed outputs like `*_framed.png`

---

## 🚪 Example Output

```json
{
  "default": {
    "show_complete_frame": true,
    "show_title": true,
    "show_subtitle": true,
    "show_keyword": true,
    "frame": "BLUE",
    "padding": 50,
    "title": {
      "color": "#000000",
      "size": 36
    },
    "subtitle": {
      "color": "#888888",
      "size": 24,
      "text": "Track and manage your expenses easily"
    }
  },
  "data": [
    {
      "filter": "framed_iPhone_15_Pro_Max-01.png",
      "title": "Dashboard Overview",
      "keyword": "dashboard"
    }
  ]
}
```

---

## 🔄 Next Improvements (Optional)

- Add AI-generated titles and descriptions
- Automate image retrieval from simulator path
- Support localization metadata for different regions



