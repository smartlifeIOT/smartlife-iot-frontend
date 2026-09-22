# Security Tab - Radio Button Selection Issue

## Problem Description

When a user has 2FA enabled with Email method and clicks on the Google Authenticator radio button, the selection does not change. The UI continues to show Email as selected even though the user clicked on Google Authenticator.

## Root Cause Analysis

### Issue Location
- **File**: `src/features/settings/hooks/useSecuritySettings.ts`
- **Line**: 214

### The Problem

The `selectedMethod` is computed using the following logic:

```typescript
const selectedMethod = data?.isEnabled ? (data?.method as TwoFactorMethod) : selectedMethodLocal;
```

**What this means:**
- If 2FA is **enabled** (`data?.isEnabled === true`), it always returns `data?.method` from the API response
- If 2FA is **disabled** (`data?.isEnabled === false`), it returns `selectedMethodLocal` (local state)

### Why This Causes the Issue

1. **When 2FA is enabled with Email:**
   - `data?.isEnabled = true`
   - `data?.method = 'email'`
   - `selectedMethod` always returns `'email'` regardless of `selectedMethodLocal`

2. **When user clicks Google Authenticator radio:**
   - `handleMethodChange('authenticator')` is called
   - This updates `selectedMethodLocal = 'authenticator'`
   - BUT `selectedMethod` still returns `'email'` because `data?.isEnabled` is true

3. **Result:**
   - The radio button appears to be clicked (visual feedback)
   - But `currentSelectedMethod` (which uses `selectedMethod`) remains `'email'`
   - The UI doesn't update to show Google Authenticator as selected

### Code Flow

```
User clicks Google Authenticator radio
  ↓
onChange={() => handleMethodChange('authenticator')}
  ↓
handleMethodChange('authenticator') in hook
  ↓
setSelectedMethodLocal('authenticator') ✅ (local state updated)
  ↓
selectedMethod = data?.isEnabled ? data?.method : selectedMethodLocal
  ↓
Since data?.isEnabled = true, returns data?.method = 'email' ❌ (ignores local state)
  ↓
currentSelectedMethod = selectedMethod || 'none' = 'email'
  ↓
Radio button checked={currentSelectedMethod === 'authenticator'} = false ❌
```

## Additional Issues

### 1. Radio Button Grouping
The Radio components don't have a `name` attribute, so they're not properly grouped as a radio button group. This means:
- Multiple radio buttons could theoretically be "checked" at the same time
- Browser native radio button behavior (auto-deselecting others) doesn't work

### 2. Inconsistent UI Logic
- **Email**: Shows "Setup Email 2FA" button when `currentSelectedMethod !== 'email'` (line 217)
- **SMS**: Shows "Setup SMS 2FA" button when `currentSelectedMethod === 'sms'` (line 257)
- **Authenticator**: Shows QR code section when `currentSelectedMethod === 'authenticator'` (line 297)

This inconsistency makes the UI behavior confusing.

## Solution

### Option 1: Allow Method Switching When 2FA is Enabled (Recommended)

Modify the `selectedMethod` logic to prioritize local state when user is actively changing methods:

```typescript
// In useSecuritySettings.ts
const selectedMethod = selectedMethodLocal || (data?.isEnabled ? (data?.method as TwoFactorMethod) : 'none');
```

This way:
- If user has made a local selection (`selectedMethodLocal`), use that
- Otherwise, use the API method if 2FA is enabled
- Otherwise, default to 'none'

### Option 2: Disable Radio Buttons When 2FA is Enabled

If switching methods while 2FA is enabled should not be allowed, disable the radio buttons:

```typescript
<Radio
  checked={currentSelectedMethod === 'authenticator'}
  onChange={() => handleMethodChange('authenticator')}
  value="authenticator"
  id="authenticator"
  disabled={twoFactorEnabled} // Add this
/>
```

### Option 3: Add Proper Radio Button Grouping

Add a `name` attribute to all radio buttons to group them properly:

```typescript
<Radio
  name="2fa-method" // Add this to all radio buttons
  checked={currentSelectedMethod === 'email'}
  onChange={() => handleMethodChange('email')}
  value="email"
  id="email"
/>
```

## Recommended Fix

Implement **Option 1** combined with **Option 3**:

1. Update `selectedMethod` logic to prioritize local state
2. Add `name` attribute to all radio buttons for proper grouping
3. Update the logic to handle method switching when 2FA is enabled (may require API call to change method)

## Files to Modify

1. `src/features/settings/hooks/useSecuritySettings.ts` - Line 214
2. `src/features/settings/components/SecurityTab.tsx` - Lines 199, 239, 279 (add `name` attribute)

## Testing Checklist

After implementing the fix:
- [ ] Click Email radio when 2FA is disabled → Email becomes selected
- [ ] Click SMS radio when 2FA is disabled → SMS becomes selected
- [ ] Click Authenticator radio when 2FA is disabled → Authenticator becomes selected
- [ ] Click different radio when 2FA is enabled with Email → Selection changes correctly
- [ ] Click different radio when 2FA is enabled with SMS → Selection changes correctly
- [ ] Click different radio when 2FA is enabled with Authenticator → Selection changes correctly
- [ ] Verify only one radio button is selected at a time
- [ ] Verify UI updates immediately when clicking radio buttons

