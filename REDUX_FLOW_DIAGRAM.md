# 🔄 Redux Data Flow Diagram

## Complete Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                       │
│                      (ClientDashboard)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      USER ACTIONS                            │
│                                                              │
│  [Create Post]  [Like Post]  [Toggle Comments]  [Add Comment]│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DISPATCH (useDispatch)                     │
│                                                              │
│  dispatch(createNewDiary(...))                              │
│  dispatch(toggleLikeOptimistic(...))                        │
│  dispatch(toggleComments(...))                              │
│  dispatch(commentOnDiary(...))                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      REDUX STORE                             │
│                    (store/store.js)                          │
│                                                              │
│  {                                                           │
│    auth: { user, token },                                   │
│    users: { ... },                                          │
│    diaries: { items, loading, ... }  ← Our focus           │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DIARIES SLICE                             │
│                 (store/diariesSlice.js)                      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  SYNC ACTIONS (Instant)                             │   │
│  │  • toggleLikeOptimistic → Update UI immediately    │   │
│  │  • toggleComments → Show/hide comments             │   │
│  │  • clearDiaries → Reset feed                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ASYNC THUNKS (API Calls)                          │   │
│  │  • fetchPublicDiaries → GET /api/diaries/public    │   │
│  │  • createNewDiary → POST /api/diaries              │   │
│  │  • likeDiary → POST /api/diaries/:id/like          │   │
│  │  • commentOnDiary → POST /api/diaries/:id/comment  │   │
│  │  • removeComment → DELETE /api/comments/:id         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API CLIENT                             │
│                      (lib/api.js)                            │
│                                                              │
│  axios.get('/api/diaries/public')                           │
│  axios.post('/api/diaries', data)                           │
│  axios.post('/api/diaries/:id/like')                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   LARAVEL BACKEND                            │
│                  (DiaryController)                           │
│                                                              │
│  Route::get('/diaries/public') → publicDiaries()            │
│  Route::post('/diaries') → store()                          │
│  Route::post('/diaries/:id/like') → toggleLike()            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE                               │
│                        (MySQL)                               │
│                                                              │
│  Tables:                                                     │
│  • users                                                     │
│  • diaries                                                   │
│  • diary_likes                                              │
│  • diary_comments                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔥 Optimistic Update Flow (Like Button)

```
USER CLICKS LIKE
       │
       ▼
dispatch(toggleLikeOptimistic(diaryId))  ← INSTANT (0ms)
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
   REDUX STATE                    UI UPDATES IMMEDIATELY
   is_liked: false → true         • Icon fills black
   likes_count: 5 → 6             • Count shows "6 likes"
                                  • Scale animation plays
       │
       ▼
dispatch(likeDiary(diaryId))  ← Background sync
       │
       ▼
API Call to Laravel
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
   SUCCESS           PENDING           FAILURE
   Update state      Show loading      Revert optimistic
   with server data  (not shown)       update
```

**Timeline:**
- **0ms:** User clicks
- **0ms:** UI updates (optimistic)
- **200-500ms:** Server responds (background)
- **Result:** User sees instant feedback! ⚡

---

## 📝 Post Creation Flow

```
USER TYPES POST
       │
       ▼
User clicks "Post"
       │
       ▼
dispatch(createNewDiary({ message, status }))
       │
       ├────────────────────────────────────┐
       │                                    │
       ▼                                    ▼
   PENDING STATE                    UI UPDATES
   creating: true                   • Button: "Posting..."
                                    • Textarea disabled
                                    • Button disabled
       │
       ▼
API Call to Laravel
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
   SUCCESS           PENDING           FAILURE
   │                                   Show error
   └─> FULFILLED STATE                Keep form data
       creating: false
       items: [newPost, ...oldPosts]
       │
       ▼
   UI UPDATES
   • New post at top
   • Form clears
   • Re-enable inputs
```

---

## 💬 Comment Toggle Flow

```
USER CLICKS "3 comments"
       │
       ▼
dispatch(toggleComments(diaryId))  ← INSTANT
       │
       ▼
REDUX STATE UPDATE
expandedComments: {
  123: false → true  // This diary
}
       │
       ▼
UI RE-RENDERS
if (expandedComments[123]) {
  // Show comment section
  <CommentSection />
}
```

**No API call needed!** State is already in Redux. ✨

---

## 📊 Component-Redux Connection

```
┌─────────────────────────────────────┐
│      ClientDashboard Component      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  useSelector (Read State)     │ │
│  │                               │ │
│  │  const diaries = useSelector( │ │
│  │    selectDiaries              │ │
│  │  )                            │ │
│  │                               │ │
│  │  Connects to Redux Store ─────┼─┼─> REDUX STORE
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  useDispatch (Update State)   │ │
│  │                               │ │
│  │  const dispatch = useDispatch()│ │
│  │                               │ │
│  │  dispatch(likeDiary(id)) ─────┼─┼─> REDUX ACTIONS
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  JSX (Render UI)              │ │
│  │                               │ │
│  │  {diaries.map(diary =>        │ │
│  │    <Post                      │ │
│  │      liked={diary.is_liked}   │ │
│  │      onLike={() =>            │ │
│  │        dispatch(like(id))     │ │
│  │      }                        │ │
│  │    />                         │ │
│  │  )}                           │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🎯 Redux Selectors (Memoized)

```
┌─────────────────────────────────────┐
│          REDUX STORE                │
│                                     │
│  {                                  │
│    diaries: {                       │
│      items: [...]                   │
│      loading: false                 │
│      expandedComments: {...}        │
│    }                                │
│  }                                  │
└─────────────────────────────────────┘
              │
              │ Selectors extract specific data
              │
    ┌─────────┼─────────┬──────────┬──────────┐
    │         │         │          │          │
    ▼         ▼         ▼          ▼          ▼
selectDiaries  loading  creating  expanded  commenting
    │                                        
    └─> [diary1, diary2, diary3]

// Usage in component:
const diaries = useSelector(selectDiaries);
// Only re-renders if 'items' array changes!
```

**Benefit:** Prevents unnecessary re-renders! 🚀

---

## 🔄 Complete User Journey (Like Post)

```
┌─────────────────────────────────────────────────────────┐
│ 1. USER                                                 │
│    Sees post with thumbs-up button                      │
│    Post shows: "5 likes"                                │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 2. CLICK EVENT                                          │
│    onClick={() => handleLike(diary.id)}                 │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 3. OPTIMISTIC UPDATE                                    │
│    dispatch(toggleLikeOptimistic(123))                  │
│    • is_liked: false → true                            │
│    • likes_count: 5 → 6                                │
│    Time: 0ms                                           │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 4. UI UPDATES (INSTANT)                                 │
│    • Icon fills BLACK                                   │
│    • Icon scales to 110%                               │
│    • Text: "6 likes"                                   │
│    • User sees change immediately! ⚡                   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 5. BACKGROUND API SYNC                                  │
│    dispatch(likeDiary(123))                             │
│    POST /api/diaries/123/like                          │
│    User doesn't wait for this!                         │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 6. SERVER RESPONSE                                      │
│    { success: true, data: { likes_count: 6, ... } }    │
│    Update Redux with authoritative data                │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 7. FINAL STATE                                          │
│    Redux state matches server                          │
│    If server said 7 likes, update to 7                 │
│    If error, revert to 5 likes                         │
└─────────────────────────────────────────────────────────┘
```

**Total time user waits: 0ms!** 🎉

---

## 📈 State Evolution Example

### Initial State (Page Load):
```javascript
{
  items: [],
  loading: true,
  error: null,
  creating: false,
  expandedComments: {}
}
```

### After Fetch:
```javascript
{
  items: [
    { id: 1, message: "Hello", likes_count: 5, is_liked_by_user: false },
    { id: 2, message: "World", likes_count: 3, is_liked_by_user: true }
  ],
  loading: false,
  error: null,
  creating: false,
  expandedComments: {}
}
```

### After Optimistic Like (Post #1):
```javascript
{
  items: [
    { id: 1, message: "Hello", likes_count: 6, is_liked_by_user: true },
    { id: 2, message: "World", likes_count: 3, is_liked_by_user: true }
  ],
  loading: false,
  error: null,
  creating: false,
  expandedComments: {}
}
```

### After Toggle Comments (Post #1):
```javascript
{
  items: [...],
  loading: false,
  error: null,
  creating: false,
  expandedComments: {
    1: true  // Post #1 comments expanded
  }
}
```

### After Create Post:
```javascript
{
  items: [
    { id: 3, message: "New post!", likes_count: 0, is_liked_by_user: false },
    { id: 1, message: "Hello", likes_count: 6, is_liked_by_user: true },
    { id: 2, message: "World", likes_count: 3, is_liked_by_user: true }
  ],
  loading: false,
  error: null,
  creating: false,
  expandedComments: { 1: true }
}
```

---

## 🎯 Key Takeaways

1. **One-Way Data Flow:** UI → Action → Redux → UI
2. **Predictable:** Same action = Same result
3. **Debuggable:** Track every state change
4. **Fast:** Optimistic updates feel instant
5. **Scalable:** Add features without refactoring

---

**This architecture makes your app feel like magic! ✨**
