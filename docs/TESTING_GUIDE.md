# Testing Guide - Dark Mode & Welcome Features

## Quick Test Steps

### 1. Test Welcome Splash Screen
- [ ] Clear browser cache or open in incognito
- [ ] Navigate to the app
- [ ] Verify splash screen appears with:
  - UniLink logo
  - "Connect. Network. Grow." tagline
  - Animated loading dots
  - Smooth fade-out after 2 seconds
- [ ] Reload page - splash should NOT appear again (session-based)
- [ ] Close browser and reopen - splash SHOULD appear again

### 2. Test Welcome Message on Home Page
- [ ] Login to the app
- [ ] Navigate to Home/Feed page
- [ ] Verify welcome message appears with:
  - Time-appropriate greeting (morning/afternoon/evening)
  - Your first name
  - Motivational message
  - Dismiss button (X)
- [ ] Click dismiss button
- [ ] Reload page - message should NOT appear
- [ ] Check localStorage: `welcomeMessageDismissed` should have today's date
- [ ] Change date in localStorage or wait 24 hours - message should reappear

### 3. Test Dark Mode Toggle
- [ ] Navigate to Settings page
- [ ] Find "Dark Mode" card (should be first after sections)
- [ ] Verify current state shows correct icon (Sun for light, Moon for dark)
- [ ] Click toggle switch
- [ ] Verify:
  - Switch animates smoothly
  - Background changes from light to dark (or vice versa)
  - All text remains readable
  - All cards update colors
  - Sidebar updates colors
  - Icons remain visible
- [ ] Navigate to different pages (Home, Network, Messages, etc.)
- [ ] Verify dark mode persists across all pages
- [ ] Reload page - dark mode preference should persist
- [ ] Check localStorage: `darkMode` should be 'true' or 'false'

### 4. Test Dark Mode on All Pages

#### Home/Feed Page
- [ ] Background is dark zinc-950
- [ ] Search bar has dark background
- [ ] Welcome message gradient is visible
- [ ] Post cards have dark background
- [ ] Trending sidebar has dark background
- [ ] Text is readable (zinc-100)
- [ ] Borders are visible (zinc-700)

#### Settings Page
- [ ] Dark mode toggle is visible and works
- [ ] All setting cards have dark background
- [ ] Section headers are readable
- [ ] Icons are visible

#### Admin Dashboard (if admin)
- [ ] Stats cards have dark background
- [ ] User table has dark background
- [ ] Search input has dark background
- [ ] All text is readable
- [ ] Charts/analytics adapt to dark mode

#### Network Page
- [ ] Connection cards have dark background
- [ ] User avatars are visible
- [ ] Action buttons are visible

#### Messages Page
- [ ] Chat list has dark background
- [ ] Message bubbles have appropriate colors
- [ ] Input field has dark background
- [ ] Text is readable

### 5. Test Admin Dashboard Fix
- [ ] Login as admin
- [ ] Navigate to Admin Dashboard
- [ ] Find a user in the user list
- [ ] Note their verification status
- [ ] Click "Verify User" or "Remove Badge"
- [ ] Verify the button text changes
- [ ] **Reload the page**
- [ ] Verify the user's verification status persists
- [ ] User should still be in the list with correct status
- [ ] Stats should update correctly

### 6. Test Scrollbar Styling
- [ ] In light mode, scrollbar should be light gray
- [ ] In dark mode, scrollbar should be dark gray
- [ ] Scrollbar should be smooth and visible in both modes
- [ ] Test on pages with scrollable content

### 7. Test System Preference Detection
- [ ] Clear localStorage (`darkMode` key)
- [ ] Set your OS to dark mode
- [ ] Reload the app
- [ ] App should start in dark mode
- [ ] Set your OS to light mode
- [ ] Clear localStorage again
- [ ] Reload the app
- [ ] App should start in light mode

### 8. Test Transitions
- [ ] Toggle dark mode
- [ ] Verify smooth 300ms transition
- [ ] No flickering or layout shifts
- [ ] All elements transition smoothly

### 9. Test Mobile Responsiveness
- [ ] Open in mobile view (or use browser dev tools)
- [ ] Test dark mode toggle on mobile
- [ ] Verify mobile menu has dark mode styling
- [ ] Verify bottom navigation has dark mode styling
- [ ] Test welcome message on mobile (should be responsive)
- [ ] Test splash screen on mobile

### 10. Test Accessibility
- [ ] Tab through dark mode toggle (should be keyboard accessible)
- [ ] Verify toggle has proper ARIA attributes
- [ ] Test with screen reader (optional)
- [ ] Verify color contrast meets WCAG standards in both modes

## Common Issues & Solutions

### Issue: Dark mode doesn't persist
**Solution**: Check browser localStorage. Clear cache and try again.

### Issue: Splash screen appears every time
**Solution**: Check sessionStorage. It should only appear once per session.

### Issue: Welcome message appears every time
**Solution**: Check localStorage `welcomeMessageDismissed` key.

### Issue: Admin verification doesn't persist
**Solution**: Check database connection and RPC function `admin_toggle_verify`.

### Issue: Colors look wrong in dark mode
**Solution**: Verify Tailwind config has `darkMode: 'class'` enabled.

### Issue: Scrollbar doesn't change in dark mode
**Solution**: Check if `dark` class is applied to `<html>` element.

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers

## Performance Checks

- [ ] No console errors
- [ ] Smooth animations (60fps)
- [ ] Fast theme switching (<300ms)
- [ ] No memory leaks
- [ ] localStorage working properly

## Final Checklist

- [ ] All features work as expected
- [ ] No console errors or warnings
- [ ] Dark mode persists across sessions
- [ ] Welcome features work correctly
- [ ] Admin dashboard fix verified
- [ ] All pages support dark mode
- [ ] Mobile responsive
- [ ] Smooth transitions
- [ ] Good performance

## Notes

- If you find any issues, check the browser console for errors
- Make sure you're using the latest version of the app
- Clear cache if you experience any issues
- Test with different user roles (student, org, admin)
