# B-4 Flight state system

Flight receives one normalized participant variant when a run starts. Texture keys are `b4-<variant>-<state>` and all 20 combinations preload from the central manifest.

`B4FlightStateMachine` enforces `hurt > happy > blinking > idle`. Pickup requests happy, damage requests hurt, and the recurring eye timer requests blinking. Temporary states return to idle. Lower-priority states cannot interrupt a higher-priority state, and reset/shutdown/disposal cancels stale callbacks.

The run never changes the saved variant. Restart begins at that variant’s idle state. The existing 108×61 display size, centered origin, 27px physics circle, collision math, trail socket, scoring, speed, parallax, and mobile behavior are unchanged. The normalized asset canvas prevents texture-state shifts.

Pattern idle, happy, hurt, and blinking artwork is now byte-distinct, visually distinct, and normalized to identical transparent bounds. No Pattern state fallback remains.
