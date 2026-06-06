const fs = require('fs');

const hellCode = fs.readFileSync('scratch_helltm.c', 'utf8');

const getArray = (name) => {
    const regex = new RegExp('static const char PROGMEM ' + name + '\\[2\\]\\[ANIM_SIZE\\] = \\{[\\s\\S]*?\\}\\};');
    return hellCode.match(regex)[0];
};

const sit = getArray('sit');
const walk = getArray('walk');
const run = getArray('run');
const bark = getArray('bark');
const sneak = getArray('sneak');

const newCode = `
#define ANIM_SIZE 96

${sit}

${walk}

${run}

${bark}

${sneak}

void animate_luna(void) {
    static uint8_t current_frame = 0;
    static uint32_t anim_timer = 0;
    
    if (timer_elapsed32(anim_timer) > 200) {
        anim_timer = timer_read32();
        
        if (luna_is_jumping || !luna_jumped_up) {
            oled_set_cursor(LUNA_X, LUNA_Y + 2);
            oled_write("     ", false);
            oled_set_cursor(LUNA_X, LUNA_Y - 1);
            luna_jumped_up = true;
        } else {
            oled_set_cursor(LUNA_X, LUNA_Y - 1);
            oled_write("     ", false);
            oled_set_cursor(LUNA_X, LUNA_Y);
        }

        current_frame = (current_frame + 1) % 2;

        led_t led = host_keyboard_led_state();
        uint8_t current_wpm = get_current_wpm();

        if (led.caps_lock) {
            oled_write_raw_P(bark[current_frame], ANIM_SIZE);
        } else if (luna_is_sneaking) {
            oled_write_raw_P(sneak[current_frame], ANIM_SIZE);
        } else if (current_wpm <= 10) {
            oled_write_raw_P(sit[current_frame], ANIM_SIZE);
        } else if (current_wpm <= 40) {
            oled_write_raw_P(walk[current_frame], ANIM_SIZE);
        } else {
            oled_write_raw_P(run[current_frame], ANIM_SIZE);
        }
    }
}
`;

let keymap = fs.readFileSync('keyboards/crkbd/keymaps/vieri/keymap.c', 'utf8');

const startIdx = keymap.indexOf('static const char PROGMEM luna_sit');
const endStr = '}\n\n// ------------------------------------------\n// RENDER LAYAR KIRI';
const endIdx = keymap.indexOf(endStr);

keymap = keymap.substring(0, startIdx) + newCode + '\n// ------------------------------------------\n// RENDER LAYAR KIRI' + keymap.substring(endIdx + endStr.length);

// Also we need to replace the call to render_luna_pose with animate_luna
keymap = keymap.replace('render_luna_pose(luna_frame);', 'animate_luna();');
// And remove luna_frame and luna_frame_timer from render_master since animate_luna handles it
keymap = keymap.replace(/static uint8_t\s+luna_frame\s*=\s*0;[\s\S]*?\/\/\s*Animasi dirender menggunakan oled_write_pixel di render_luna_pose/, '// Animasi dirender oleh animate_luna()');

fs.writeFileSync('keyboards/crkbd/keymaps/vieri/keymap.c', keymap);
console.log('Replaced successfully');
