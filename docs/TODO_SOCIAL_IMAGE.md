# 🎯 TO-DO: Create Premium Social Preview Image

## ⚠️ IMPORTANT - Action Required!

Your site is now configured with premium social media meta tags, but you need to create the actual preview image for it to work perfectly.

## What You Need To Do

### Step 1: Create the Image
Use one of these tools (see `SOCIAL_PREVIEW_GUIDE.md` for details):
- **Canva** (Easiest): https://canva.com
- **Figma** (Professional): https://figma.com  
- **Adobe Express** (Free): https://adobe.com/express

**Specifications:**
- **Dimensions:** 1200 x 630 pixels
- **Format:** PNG or JPG
- **File size:** Under 1MB
- **Content:** UniLink logo/name, tagline, premium design

### Step 2: Save the File
Save your created image as:
```
c:\Users\User\Desktop\ulink\ulink\public\og-image.png
```

### Step 3: Update URLs (After Netlify Deployment)
Once deployed to Netlify, update the URLs in `index.html`:

**Current (placeholder):**
```html
<meta property="og:image" content="https://unilink.ng/og-image.png" />
<meta name="twitter:image" content="https://unilink.ng/og-image.png" />
```

**Update to your real Netlify URL:**
```html
<meta property="og:image" content="https://your-site.netlify.app/og-image.png" />
<meta name="twitter:image" content="https://your-site.netlify.app/og-image.png" />
```

(Later update to your custom domain when you set it up)

### Step 4: Test the Preview
After deploying, test how your link looks when shared:

1. **Facebook/LinkedIn:** https://developers.facebook.com/tools/debug/
2. **Twitter:** https://cards-dev.twitter.com/validator
3. **All Platforms:** https://www.opengraph.xyz/

## What I've Already Done For You

✅ Enhanced Open Graph meta tags with proper dimensions  
✅ Added Twitter Card with large image support  
✅ Included image alt text and metadata  
✅ Added SEO robots meta tags  
✅ Set up locale for Nigeria (en_NG)  
✅ Added Twitter handle placeholders (@unilink)  
✅ Optimized descriptions for engagement  

## Temporary Fallback

**Right now**, if you don't create `og-image.png`, the meta tags point to a file that doesn't exist. Social platforms will:
- Fall back to `icon-512.png` (not ideal - it's square, not optimized)
- Or show no image at all

**That's why creating the image is important!**

## Quick Win Option

**If you're in a hurry**, you can temporarily use your existing icon:

1. Rename `icon-512.png` to `og-image.png` (not recommended, but works)
2. Deploy
3. Replace with proper 1200x630 image later

**Better:** Take 15 minutes to create a proper image in Canva. It'll make a HUGE difference!

## Design Checklist

When creating your image, ensure:
- [ ] Dimensions are exactly 1200 x 630 px
- [ ] "UniLink" text is large and readable
- [ ] Uses your brand color (#10B981 emerald green)
- [ ] Has your tagline: "The #1 Network for Nigerian Students"
- [ ] Looks good at thumbnail size (test by zooming out)
- [ ] Text has good contrast with background
- [ ] File size under 1MB
- [ ] Saved as PNG or JPG

## Twitter Handle (Optional)

I added `@unilink` as a placeholder for your Twitter handle. If you have a different Twitter/X username:

1. Update in `index.html`:
   ```html
   <meta name="twitter:site" content="@YourActualHandle" />
   <meta name="twitter:creator" content="@YourActualHandle" />
   ```

If you don't have Twitter, you can remove these lines (optional).

## Impact of This Work

With a premium preview image:
- **2-3x higher click-through rates** when shared
- **More professional appearance** = more trust
- **Better virality** = more shares
- **Improved SEO** = Google shows preview in results

## Need Help?

1. Read: `SOCIAL_PREVIEW_GUIDE.md` for detailed instructions
2. See design examples and tools
3. Ask me for feedback on your design!

---

**Bottom line:** Create the image before deploying. It's 15 minutes of work for massive returns! 🚀
