// ==================================================================================
// ========================= Welcome to your  init.js  file! ========================
// ==================================================================================

// Everything in this file, this JS program, is run whenever you open VSCode.
// (Assuming you have the `easy-extensibility` package installed of-course!)
//
// This is useful for adding your own snippets, useful commands, to the `cmd+h` command pallet
// or for configuring VSCode depending on the workspace, date, machine, etc.

// If you haven't already, invoke `cmd+h tutorial` to read the tutorial first!

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
let welcome = `Welcome ${process.env.USER}! Today is ${today}!`
let button = `A beautiful day to be alive 😃💐😁`
E.message(welcome, button)

// Notice that we can use `await` clauses liberally in our init.js file.
// How does this work? The `easy-extensibility` extension implicitly wraps the
// entire init.js file in an ambient async IIFE.

// ========================================  ========================================
// ============= Let's add a new command to the `cmd+h` command pallet. ============
// ========================================  ========================================

// Let's add the command that let's me make the above "banner-style comments" 😉

// But first, let's make a super tiny (but, for me, super useful) command to see things in action!
commands['Enclose selection in unicode quotes'] = E => E.replaceSelectionBy(str => `“${str}”`)
//
// Now run:  cmd+h reload user's init.js file RETURN
// Then type some text, select it, cmd+h enclose selection in unicode quotes RETURN

// Then another tiny command, to get comfortable with this setup.
commands['Make me smile!'] = E => E.terminal('fortune | cowsay | lolcat')
//
// Now run:  cmd+h reload user's init.js file RETURN cmd+h make me smile RETURN

// Of-course, after I see what makes me smile, I'd like to simple select it and have an image
// that I can share with my colleagues; e.g., on Slack. So let's make a utility to do just that!

/** Interactively capture screen and save to clipboard; then paste in Slack, etc, with ⌘-c
 * 
 * After we run this command, we can swipe up on mousepad to select different desktops, then
 * click & drag to select portition of screen to capture.

 * Captured screen is NOT saved to disk, only copied to clipboard.

 * In MacOs,
 *  - Command + Shift + 5  ⇒  Select screen record
 *  - Command + Shift + 4  ⇒  Selection Screenshot
 *  - Command + Shift + 3  ⇒  Screenshot
 * 
 * Unlike the second option above,
 * 1. this command saves things to clipboard, and
 * 2. does not litter my desktop (or anywhere else) with screenshots that I doubt I'll need in the future.
 * 
 * See: https://osxdaily.com/2011/08/11/take-screen-shots-terminal-mac-os-x
 */
commands['screencapture: Interactively capture screen and save to clipboard; then paste with ⌘-c'] = E =>
  E.shell('screencapture -i -c')

// Anyhow, finally, let's get to a slightly more JavaScripty command:
//
{
  // Example usage:  E.message( bannerComment("hiya, amigo, and friends!") )
  function bannerComment(str, style = '=') {
    let repetitions = Math.round((80 - str.length) / 2)
    let banner = Array(repetitions).fill(style).join('')
    let comment = ['//', banner, str, banner].join(' ')
    return comment
  }

  commands['Make selection into a banner comment'] = E => E.replaceSelectionBy(bannerComment)
}

// Now run:  cmd+h reload user's init.js file RETURN
// Then type some text, select it, cmd+h make selection into a banner comment RETURN

// ==================================================================================
// ============= Extension: Quickly Jumping to Favorited Webpages/Videos ============
// ==================================================================================

// Often, there are a number of Youtube videos, or webpages, that I'd like to jump
// to quickly. I'd like to have that menu of items be right here in my editor.
// So, let's make some commands to do just that!

commands["Youtube ~ Background audio while I'm working"] = async E => {
  let videos = {
    'Daily Supplications': 'https://youtu.be/9m9yE7qtq5w',
    'Uncle Iroh': 'https://youtu.be/jhvUqV3qeC0',
    'Oh Hussain!': 'https://youtu.be/6EHroVqxWDo',
    'ASMR ~ Walking Vancouver': 'https://youtu.be/hL2NYxKGTts',
    'ASMR ~ Vancouver Cafe': 'https://youtu.be/7sg-dfYLGRQ'
  }
  const url = await E.readInput('What do you want to listen to?', videos)
  E.browseURL(url)
}

// ==================================================================================
// =============== Running arbitrary CLI programs on the current file ===============
// ==================================================================================

/** `cmd+h gulp` runs Gulp on the current file, whereas `shift+cmd+h gulp` runs the
 * gulp precommit task on the entire repo.
 * I intentionally `cd` to the parent directory for those rare times when I have
 * a file open outside of its workspace.
 */
commands['File: Gulp tests!'] = E => {
  const cmd = E.currentPrefixArgument ? 'gulp precommit' : `npx gulp test-partial --file=${E.currentFileName()}`
  E.terminal(`cd ${E.currentDirectory()}; ${cmd}`, 'Gulp!')
}

//! Not needed, just invoke `alt+shift+f` to `f`ormat the current active editor.
// commands["File: Prettify!"] = E => E.shell(`prettier --write ${E.currentFileName()}`)

//! Not needed, just use the Flow VSCode Extension
// commands['File: Flow check!'] = E => E.terminal(`flow check ${E.currentFileName()}`)
