# 🎉 Build APK with GitHub Actions (FREE!)

## ✅ Setup Complete!

I've added a GitHub Actions workflow that will build your Android APK for FREE in the cloud!

## 🚀 How to Build Your APK

### Step 1: Go to GitHub Actions

1. Open your browser
2. Go to: https://github.com/syntaxdrive/ulink/actions
3. You should see the "Build Android APK" workflow

### Step 2: Run the Workflow

1. Click on "Build Android APK" in the left sidebar
2. Click the "Run workflow" button (top right)
3. Select branch: `main`
4. Click the green "Run workflow" button

### Step 3: Wait for Build (5-10 minutes)

The workflow will:
- ✅ Install dependencies
- ✅ Build your web app
- ✅ Sync with Capacitor
- ✅ Build Android APK
- ✅ Upload APK as artifact

### Step 4: Download Your APK

1. Once the workflow completes (green checkmark ✓)
2. Click on the completed workflow run
3. Scroll down to "Artifacts" section
4. Click "app-debug" to download your APK!

## 📱 Install on Your Device

1. Transfer the downloaded APK to your Android device
2. Enable "Install from unknown sources" in Settings
3. Tap the APK to install
4. Open the app and test!

## 🔄 Future Builds

The workflow will automatically run when you:
- Push changes to the `main` branch
- Modify files in `android/`, `src/`, or `package.json`

Or you can manually trigger it anytime from the Actions tab!

## 💡 Why This is Better

✅ **Free** - GitHub Actions is free for public repos
✅ **No local setup** - No need for Android Studio or SDK
✅ **Fast** - GitHub's servers are fast
✅ **Reliable** - No network timeout issues
✅ **Automated** - Can run on every push

## 🎯 Live Updates Still Work!

Remember: You only need to build the APK once. After that:

```bash
# Make changes
npm run build

# Create bundle
npx capawesome apps:bundles:create --path dist

# Update bundle
npx capawesome apps:bundles:update --bundle-id <BUNDLE_ID>
```

Users get updates automatically! No APK rebuild needed! 🎉

## 📊 Workflow Details

- **Runs on**: Ubuntu (Linux)
- **Node version**: 18
- **Java version**: 17
- **Build type**: Debug APK
- **Retention**: 30 days

## 🔧 Customization

To build a release APK instead:

Edit `.github/workflows/build-android.yml` and change:
```yaml
./gradlew assembleDebug
```
to:
```yaml
./gradlew assembleRelease
```

---

## 🎉 Next Steps

1. **Go to GitHub Actions**: https://github.com/syntaxdrive/ulink/actions
2. **Run the workflow**
3. **Download your APK**
4. **Install and test!**

**Your APK will be ready in about 5-10 minutes!** ⏱️
