# 🔍 Like Button Debug Guide

## Quick Test Steps

### 1. Open Browser DevTools
Press `F12` or `Ctrl+Shift+I`

### 2. Go to Console Tab
You should see console logs when clicking like

### 3. Clear Console
Click the 🚫 icon to clear old logs

### 4. Click a Like Button
Watch for these logs in order:

```javascript
// Step 1: Optimistic update (instant)
"Optimistic update - diary ID: 123"

// Step 2: API call
"Like API Response: { success: true, data: {...}, is_liked: true }"

// Step 3: Redux update
"Updating diary with server data: { id: 123, is_liked_by_user: true, likes_count: 6, ... }"

// Step 4: Success
"Like synced with server: { diaryId: 123, data: {...} }"
```

## Expected Behavior

### When Clicking LIKE:
1. **Instant (0ms):**
   - Icon fills BLACK
   - Icon scales up (110%)
   - Count increases
   - Text becomes bold

2. **After API (~300ms):**
   - Icon STAYS BLACK ✅
   - Count stays increased ✅
   - No flicker or change ✅

### When Clicking UNLIKE:
1. **Instant (0ms):**
   - Icon becomes GRAY outline
   - Icon scales back (100%)
   - Count decreases
   - Text becomes normal

2. **After API (~300ms):**
   - Icon STAYS GRAY ✅
   - Count stays decreased ✅
   - No flicker or change ✅

## If It's NOT Working

### Symptom 1: Button flickers (Black → Gray → Black)
**Problem:** Optimistic update is being overwritten

**Check Console for:**
```javascript
"Updating diary with server data: { ..., is_liked_by_user: false }"
// ❌ Should be TRUE when you liked it!
```

**Solution:** Backend not refreshing properly
```bash
# Check if refresh() exists in DiaryController.php line 117
php artisan tinker
>>> $diary = App\Models\Diary::first();
>>> $diary->is_liked_by_user  // Should work
```

### Symptom 2: Button stays gray after clicking
**Problem:** Optimistic update not working

**Check Console for:**
```javascript
// Missing this log:
"Optimistic update - diary ID: 123"
```

**Solution:** Check handleLike function
```javascript
// Should dispatch toggleLikeOptimistic FIRST
dispatch(toggleLikeOptimistic(diaryId));
```

### Symptom 3: No console logs at all
**Problem:** Code not running

**Solution:** Hard refresh
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Symptom 4: Console shows errors
**Common Errors:**

#### "Cannot read property 'is_liked_by_user' of undefined"
```javascript
// Problem: data object is undefined
// Check: Backend response structure
```

#### "Network Error" or "401 Unauthorized"
```javascript
// Problem: Not authenticated
// Solution: Login again
```

#### "500 Internal Server Error"
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log
```

## Manual Debug Test

Open browser console and run:

```javascript
// Get current state
const state = window.__REDUX_DEVTOOLS_EXTENSION__?.();
console.log('Current diaries:', state?.diaries?.items);

// Find a diary
const diary = state?.diaries?.items?.[0];
console.log('First diary:', diary);
console.log('Is liked?', diary?.is_liked_by_user);
console.log('Likes count:', diary?.likes_count);
```

## Backend Debug (Laravel)

### Check if refresh() is working:

```bash
php artisan tinker
```

Then run:
```php
// Create a test scenario
$user = App\Models\User::first();
$diary = App\Models\Diary::first();

// Check current state
echo "Before like: " . $diary->is_liked_by_user . "\n";

// Create like
App\Models\DiaryLike::create(['diary_id' => $diary->id, 'user_id' => $user->id]);

// WITHOUT refresh
echo "Without refresh: " . $diary->is_liked_by_user . "\n";  // FALSE ❌

// WITH refresh
$diary->refresh();
echo "With refresh: " . $diary->is_liked_by_user . "\n";     // TRUE ✅
```

## Network Tab Check

1. Open DevTools → Network tab
2. Click Like button
3. Find request: `POST /api/diaries/123/like`
4. Click on it
5. Check **Response** tab

**Should see:**
```json
{
  "success": true,
  "message": "Diary liked",
  "is_liked": true,
  "likes_count": 6,
  "data": {
    "id": 123,
    "message": "...",
    "is_liked_by_user": true,  // ← This should match is_liked
    "likes_count": 6,
    ...
  }
}
```

**If `is_liked_by_user` is FALSE but `is_liked` is TRUE:**
❌ refresh() is not working!

## Redux DevTools Check

### Install Extension:
- Chrome: https://chrome.google.com/webstore/detail/redux-devtools/
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/

### Steps:
1. Open Redux DevTools
2. Click Like button
3. Watch actions in order:

```
1. diaries/toggleLikeOptimistic
   State change:
   - is_liked_by_user: false → true
   - likes_count: 5 → 6

2. diaries/like/pending
   State change:
   - likingDiaryId: null → 123

3. diaries/like/fulfilled
   Payload: { diaryId: 123, data: { is_liked_by_user: true, ... } }
   State change:
   - is_liked_by_user: true (no change) ✅
   - likes_count: 6 (no change) ✅
   - likingDiaryId: 123 → null
```

**If step 3 shows `is_liked_by_user: true → false`:**
❌ Backend is returning wrong data!

## Quick Fixes

### Fix 1: Clear Everything
```bash
# Clear browser
Ctrl + Shift + Delete (clear cache)

# Clear Laravel cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Fix 2: Restart Servers
```bash
# Stop Laravel
Ctrl + C

# Restart
php artisan serve

# Stop Vite
Ctrl + C

# Restart
npm run dev
```

### Fix 3: Check Database
```bash
php artisan tinker
>>> App\Models\DiaryLike::where('user_id', 1)->get();
// Should show your likes
```

## Success Indicators

✅ Console shows all 4 log messages
✅ Button stays black after clicking
✅ No flicker or color change
✅ Network tab shows correct response
✅ Redux DevTools shows smooth state transition

---

**After testing, the like button should stay BLACK when liked! 🎉**

If still not working, check the console logs and report what you see!
