# Happy Colors – Color & Learn (Android APK + Web App)

Offline-ready 3D Cartoon Coloring & Bilingual (English + Urdu) Kids Learning App.

## How to Build Your Android APK on GitHub (No Android Studio Required)

1. **Create a new repository** on GitHub (public or private).
2. **Unzip** `HappyColors-GitHub-APK.zip` on your computer and push/upload all files (make sure the hidden `.github/workflows/build-apk.yml` folder is included!) to the `main` branch.
   - Tip: Using Git in a terminal (`git init && git add . && git commit -m "Initial commit" && git branch -M main && git remote add origin <YOUR_REPO_URL> && git push -u origin main`) automatically includes `.github/workflows/build-apk.yml`.
3. Open your GitHub repository → click the **Actions** tab → open **Build Happy Colors Android APK** → download the **HappyColors-Debug-APK** artifact (`app-debug.apk`).
4. Transfer `app-debug.apk` to your Android phone or tablet (Android 7.0+) and tap to install.

## Optional: Build Locally in Android Studio
- Open the `android/` folder in Android Studio.
- Click **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
