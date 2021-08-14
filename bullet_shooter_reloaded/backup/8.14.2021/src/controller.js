// game joypad object
const joypad = {
    up: false, down: false, left: false, right: false,
    a: false, b: false,
    e: false,

    keybinds: {
        up:     ['ArrowUp', 'KeyW'],
        down:   ['ArrowDown', 'KeyS'],
        left:   ['ArrowLeft', 'KeyA'],
        right:  ['ArrowRight', 'KeyD'],
        a:      ['KeyZ', 'Space'],
        b:      ['KeyX', 'RightShift'],
        e:      ['KeyE']
    }
};

const controller = {
    firingKeys: {},
    started: false,

    SetJoypadState(e, val) {
        switch (e.code) {
            case joypad.keybinds.up[0]: case joypad.keybinds.up[1]:
                joypad.up = val;
                break;
            case joypad.keybinds.down[0]: case joypad.keybinds.down[1]:
                joypad.down = val;
                break;
            case joypad.keybinds.left[0]: case joypad.keybinds.left[1]:
                joypad.left = val;
                break;
            case joypad.keybinds.right[0]: case joypad.keybinds.right[1]:
                joypad.right = val;
                break;

            case joypad.keybinds.a[0]: case joypad.keybinds.a[1]:
                joypad.a = val;
                break;
            case joypad.keybinds.b[0]: case joypad.keybinds.b[1]:
                joypad.b = val;
                break;

            case joypad.keybinds.e[0]:
                joypad.e = val;
                break;

            default: return false;
        }
        return true;
    },

    // key events
    OnKeyDown(e) {
        if (this.firingKeys[e.keyCode] === true) return;
            this.firingKeys[e.keyCode] = true;

        if (this.SetJoypadState(e, true))
            e.preventDefault();
    },

    OnKeyUp(e) {
        delete this.firingKeys[e.keyCode];
        this.SetJoypadState(e, false);
    },

    // listeners
    Start() {
        if (this.started)
            return;
        this.started = true;

        document.addEventListener('keydown', e => controller.OnKeyDown(e));
        document.addEventListener('keyup', e => controller.OnKeyUp(e));
    }
};