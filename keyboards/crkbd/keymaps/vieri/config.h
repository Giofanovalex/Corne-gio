#pragma once

/*
 * Force the hand orientation.
 * MASTER_LEFT means the USB cable is plugged into the Left half.
 * The Right half is connected via the TRRS cable and acts as the receiver/slave.
 * This resolves the issue where the right side does not respond due to EEPROM conflicts.
 */
#define MASTER_LEFT

// RGB Light and OLED_TIMEOUT settings have been removed
// Custom OLED timeout and dimming logic is handled in keymap.c

// Sync WPM data from master (left) to slave (right) via TRRS cable
#define SPLIT_WPM_ENABLE

