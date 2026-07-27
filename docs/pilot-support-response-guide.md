# Pilot Support Response Guide

Use friendly product language. Never send correlation IDs, database errors, function names, stack traces, access codes, student PINs, or internal environment details to an end user.

## First response

1. Acknowledge the blocked task.
2. Confirm that entered information should remain available when that is true.
3. Ask for the time, browser/device, program type, and the action they attempted.
4. Offer the approved in-place retry or recovery path.
5. Escalate internally with sanitized diagnostics.

## Approved responses

### Program creation

**We couldn't create your program.** Your information hasn't been lost. Please try again. If the problem continues, contact hello@caidenscourage.com.

### Pilot Programs list

We couldn’t load the pilot programs. Try again.

### Child cannot launch

Confirm the selected child and sign-in session, then choose **Try Again**. If another child is open on the device, return to the participant chooser first.

### Week is locked

Confirm the required earlier activity is complete and that the correct participant is selected. If the week should be available, contact support without creating a replacement account.

### Progress appears missing

Confirm the participant, program, and module. Sign out and back in once. Do not repeat completed assessments until support confirms whether the save was received.

### Welcome email did not arrive

Check spam and promotions, confirm the signup address, and wait a few minutes. Do not create a duplicate account. Escalate internally so delivery status and duplicate suppression can be checked.

## Internal escalation record

Record severity, timestamp, environment, sanitized user/program identifier, route, action, browser/device, correlation ID from server logs, and whether retry succeeded. Keep this record in the approved private support system, not Git.
