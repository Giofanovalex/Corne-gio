import re

with open('scratch_helltm.c', 'r') as f:
    hell_code = f.read()

# Extract arrays
sit = re.search(r'static const char PROGMEM sit.*?\{.*?\} \};', hell_code, re.DOTALL).group(0)
walk = re.search(r'static const char PROGMEM walk.*?\{.*?\} \};', hell_code, re.DOTALL).group(0)
run = re.search(r'static const char PROGMEM run.*?\{.*?\} \};', hell_code, re.DOTALL).group(0)
bark = re.search(r'static const char PROGMEM bark.*?\{.*?\} \};', hell_code, re.DOTALL).group(0)
sneak = re.search(r'static const char PROGMEM sneak.*?\{.*?\} \};', hell_code, re.DOTALL).group(0)

# Build replacement string
new_arrays = f'''#define ANIM_SIZE 96

{sit}

{walk}

{run}

{bark}

{sneak}

void render_luna_pose(uint8_t frame) {{
    uint8_t f = frame % 2;
    uint8_t wpm = get_current_wpm();
    led_t led = host_keyboard_led_state();
    
    // Bersihkan area sisa jump
    if (luna_is_jumping || !luna_jumped_up) {{
        oled_set_cursor(LUNA_X, LUNA_Y + 2);
        oled_write("     ", false);
        oled_set_cursor(LUNA_X, LUNA_Y - 1);
    }} else {{
        oled_set_cursor(LUNA_X, LUNA_Y - 1);
        oled_write("     ", false);
        oled_set_cursor(LUNA_X, LUNA_Y);
    }}

    if (led.caps_lock) {{
        oled_write_raw_P(bark[f], ANIM_SIZE);
    }} else if (luna_is_sneaking) {{
        oled_write_raw_P(sneak[f], ANIM_SIZE);
    }} else if (wpm <= 10) {{
        oled_write_raw_P(sit[f], ANIM_SIZE);
    }} else if (wpm <= 40) {{
        oled_write_raw_P(walk[f], ANIM_SIZE);
    }} else {{
        oled_write_raw_P(run[f], ANIM_SIZE);
    }}
}}
'''

with open('keyboards/crkbd/keymaps/vieri/keymap.c', 'r', encoding='utf-8') as f:
    keymap = f.read()

# Find the start of luna_sit and end of render_luna_pose
start_idx = keymap.find('static const char PROGMEM luna_sit')
if start_idx == -1: print('Could not find luna_sit'); exit(1)

end_str = '}\n\n// ------------------------------------------\n// RENDER LAYAR KIRI'
end_idx = keymap.find(end_str)
if end_idx == -1: print('Could not find end of render_luna_pose'); exit(1)

new_keymap = keymap[:start_idx] + new_arrays + '\n// ------------------------------------------\n// RENDER LAYAR KIRI' + keymap[end_idx + len(end_str):]

with open('keyboards/crkbd/keymaps/vieri/keymap.c', 'w', encoding='utf-8') as f:
    f.write(new_keymap)

print('Injected successfully!')
