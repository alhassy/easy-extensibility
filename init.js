// ==================================================================================
// ========================= Welcome to your  init.js  file! ========================
// ==================================================================================

// Everything in this file, this JS program, is run whenever you open VSCode.
// (Assuming you have the `easy-extensibility` pacakge installed of-course!)
//
// This is useful for adding your own snippets, useful commands, to the `cmd+h` command pallet
// or for configuring VSCode depending on the workspace, date, machine, etc.

// The current implementation treats the user's init file as if it were dynamically-scoped:
// The `~/init.js` file may mention `E, commands, vscode` with no ceremonial import of any kind!
// (This is similar to the use of the keyword `this` in object-oriented programming: 
//  It's an implicitly introduced argument!)

// Below are sample fragments to help you get started; all the best!

// It is encouraged to keep this file under version control, then make a symbolic link;
// e.g.,   ln -s ~/my-cool-repo/init.js ~/init.js

// ==================================================================================
// ========= 🚀 Whenever we open VSCode, let's see a motivating message! 💪 ==========
// ==================================================================================
let today = (await E.shell('date')).stdout
let welcome = `Welcome ${ process.env.USER }! Today is ${today}!`
let button = `A beautiful day to be alive 😃💐😁`
E.message(welcome, button)

// Notice that we can use `await` clauses liberally in our init.js file.
// How does this work? The `easy-extensibility` extension implicitly wraps the 
// entire init.js file in an ambient async IIFE.

// ========================================  ========================================
// ============= Let's add a new command to the `cmd+h` command pallete. ============
// ========================================  ========================================

// Let's add the command that let's me make the above "banner-style comments" 😉

// Example usage:  E.message( bannerComment("hiya, amigo, and friends!") )
function bannerComment (str, style = "=") {
    let repetitions = Math.round((80 - str.length) / 2)
    let banner = Array(repetitions).fill(style).join('')
    let comment = ["//", banner, str, banner].join(' ')
    return comment
}

commands["Make selection into a banner comment"] = E => E.replaceSelectionBy(bannerComment)

// Now run:  cmd+h reload user's init.js file RETURN
// Then type some text, select it, cmd+h make selection into a banner comment RETURN

// ========================================  ========================================