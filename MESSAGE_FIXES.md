# Fixes for Message Notifications and Double Checkmark

## Issue 1: Message notifications should show sender name

**File:** `src/features/layout/DashboardLayout.tsx`
**Lines:** 149-158

**Current code:**
```typescript
// Basic throttle/debounce for rapid messages could count here, but for now just increment safely
setUnreadMessages(prev => Math.min(prev + 1, 99)); // Cap at 99 to avoid massive numbers

// Fetch sender name lightly or skip if overload
// We can just say "New Message" to save a network request if lagging
handleNotification(
    'New Message',
    'You received a new message',
    () => navigate(`/app/messages?chat=${payload.new.sender_id}`)
);
```

**Replace with:**
```typescript
// Fetch sender name
let senderName = 'Someone';
if (payload.new.sender_id) {
    const { data: sender } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', payload.new.sender_id)
        .single();
    if (sender) senderName = sender.name;
}

setUnreadMessages(prev => Math.min(prev + 1, 99));
handleNotification(
    `New message from ${senderName}`,
    payload.new.content || 'Sent an attachment',
    () => navigate(`/app/messages?chat=${payload.new.sender_id}`)
);
```

## Issue 2: Double checkmark not showing when messages are read

**Status:** The code logic is CORRECT. The issue is likely:

1. **Realtime publication not enabled** - Already fixed with `fix_realtime_publication.sql`
2. **Messages not being marked as read** - The `markAsRead` function exists and is called when opening a chat

**Verification steps:**
1. Ensure the database migration `fix_realtime_publication.sql` was executed successfully
2. Test by:
   - User A sends a message to User B
   - User A should see single checkmark (delivered)
   - User B opens the chat
   - User A should see double checkmark (read) appear instantly

**If still not working, check:**
- Browser console for any errors
- Database logs to ensure UPDATE events are being broadcast
- RLS policies allow the sender to see the updated `read_at` field

**Current implementation in MessagesPage.tsx (lines 137-147):**
```typescript
{isMe && (
    msg.read_at ? (
        <div className="flex items-center gap-0.5" title={`Seen ${new Date(msg.read_at).toLocaleString()}`}>
            <CheckCheck className="w-3.5 h-3.5 text-white" />
        </div>
    ) : (
        <div className="flex items-center gap-0.5" title="Delivered">
            <Check className="w-3.5 h-3.5 text-emerald-200" />
        </div>
    )
)}
```

This is correct - single check for delivered, double check for read.
