# Portal access / session flow fix plan

## Files being changed

| File | Purpose |
|------|---------|
| `src/lib/portalIdentity.ts` | Shared error copy for unlinked email |
| `src/lib/kidPlayReturnUnlock.ts` | Access-code scope validation (claim + family access) |
| `src/lib/kidPlaySessionEnd.ts` | In-shell pause (no play-pause redirect on exit) |
| `src/pages/KidPlaySessionLayout.tsx` | Return To Session modal overlay inside Kid Shell |
| `src/components/kid-play-shell/KidPlayFamilySoftLockGate.tsx` | In-shell resume, scoped errors, PIN skip when remembered |
| `src/hooks/usePortalUnlock.ts` | PIN camp scope, family access code after claim, email errors |
| `src/lib/portalAccessResolve.ts` | Claim lookup exposes camp program code |
| `src/lib/__tests__/portalSessionFlow.test.ts` | Required flow tests |

## Behavior preserved

- Dark blue **Return To Session** modal UI (same component/CSS, same fields)
- Parent email → Family Portal overview path (`familyReturnSessionPath`)
- Facilitator email → Facilitator Roster (`facilitatorReturnSessionPath`)
- Student PIN → Kid Shell / Weekly Adventures
- Family Claim Code for **first-time** parent claim (portal + parent role + claim modal)
- Family Access Code as **ongoing** parent login after claim
- Remember-device / remembered access code prefill when scoped
- End Session and Switch program still exit to marketing portal

## Behavior changed

- Exiting Kid Shell **stays on the shell route** and shows Return To Session overlay (no auto redirect to `/portal` or play-pause page)
- Student PIN verifies against **camp program code** (via family links), not family program code only
- Wrong email on remembered program shows: **"That email is not connected to this program."**
- After parent claim completes, remembered access code stores **Family Access Code**, not claim code
- Claim code + access code both validate when scoped to the same family/camp linkage
- Student PIN on Return To Session skips redundant access-code re-check when program is already remembered

## Risks

- In-shell pause keeps DB session `active` until End Session (privacy tradeoff by design for in-place modal)
- Existing users with claim code remembered may need Switch program once to store family access code
- Claim-code lookup adds one Supabase read on access validation
