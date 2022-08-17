// ==================================================================================
// ========================= Welcome to your  init.js  file! ========================
// ==================================================================================

// Everything in this file, this JS program, is run whenever you open VSCode.
// (Assuming you have the `easy-extensibility` package installed of-course!)
//
// This is useful for adding your own snippets, useful commands, to the `cmd+h` command pallet
// or for configuring VSCode depending on the workspace, date, machine, etc.

// If you haven't already, invoke `cmd+h tutorial` to read the tutorial first!

// The current implementation treats the user's init file as if it were semi-dynamically-scoped:
// The `~/init.js` file may mention `E, commands, vscode` with no ceremonial import of any kind!
// (This is similar to the use of the keyword `this` in object-oriented programming:
//  It's an implicitly introduced argument!)

// Below are sample fragments to help you get started; all the best!
// (More honestly, this is Musa's personal init.js being shared with the world.)

// It is encouraged to keep this file under version control, then make a symbolic link;
// e.g.,   ln  -s  ~/my-cool-repo/init.js  ~/init.js

// ==================================================================================
// ========= 🚀 Whenever we open VSCode, let's see a motivating message! 💪 ==========
// ==================================================================================
let welcome = `Welcome ${process.env.USER}! Today is ${E.shell('date')}!`
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
commands['Enclose selection in unicode quotes'] = {
  'cmd+i q': E => E.replaceSelectionBy(str => `“${str}”`)
}
//
// Now run:  cmd+h reload user's init.js file RETURN
// Then type some text, select it, cmd+h enclose selection in unicode quotes RETURN

// Then another tiny command, to get comfortable with this setup.
commands['Make me smile!'] = E => E.terminal('fortune | cowsay | lolcat')
//
// Now run:  cmd+h reload user's init.js file RETURN cmd+h make me smile RETURN

// Of-course, after I see what makes me smile, I'd like to simple select it and have an image
// that I can share with my colleagues; e.g., on Slack. On MacOs, just `Command + Shift + 4`.

// Anyhow, finally, let's get to a slightly more JavaScripty command:
//
// Example usage:  E.message( bannerComment("hiya, amigo, and friends!") )
//
// “Cmd+Shift+h banner” places a box around the selected text;
// “Cmd+h banner” places a left-right banner beside/around the selected text.
//
function bannerComment(str, style = '=') {
  let repetitions = Math.round((120 - str.length) / 2)
  let banner = Array(repetitions).fill(style).join('')
  let comment = [`//` + banner, str, banner].join(' ')
  let delimiter = comment.replace(/[^\/]/g, style)
  return !E.currentPrefixArgument ? comment : `${delimiter}\n${comment}\n${delimiter}`
}
//
commands['Make selection into a banner comment'] = E => E.replaceSelectionBy(bannerComment)

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

// Invoke `alt+shift+f` to `f`ormat the current active editor according to existing rules;
// For when I really want to enforce a particular style.
// E.g., in a file that does not live in a repo with dedicated linting:
commands['File: Prettify!'] = E => {
  const options = `--no-semi --print-width 120 --prose-wrap always --single-quote --trailing-comma none --arrow-parens avoid`
  E.shell(`prettier ${options} --write ${E.currentFileName()}`)
  E.message(`Prettified with options:  ${options}`)
}

//===================================================================================
//==================================== Cosmetics ====================================
//===================================================================================

E.set('workbench.colorTheme', 'Solarized Light') // Use a neato theme
E.set('workbench.colorTheme', 'Light Pink') // From extension: @id:mgwg.light-pink-theme
// Note: Cmd+K Cmd+T to see all themes and try them out on-the-fly.

E.set('semantic-highlighting.isEnable', true) // colors-as-types!

// Add a motavational motto to the VSCode frame window title
E.set('window.title', '${activeEditorLong} Living The Dream (•̀ᴗ•́)و')

// Make "=>, !=, ===, <=, >=, <>, etc" look like single-symbol Unicode!
E.set('editor.fontLigatures', true)

// A nice comfortable font, at a reasonable size.
E.set('editor.fontFamily', 'Fantasque Sans Mono')
E.set('editor.fontSize', 14)

// When I write a word, such as “ green ” or “ #19f9d8 ”, then show it to me as that colour!
E.set('colorize.languages', ['javascript'])

// I want nice colours for my brackets, and I also want their “scope” to be colourfully indicated.
E.set('editor.bracketPairColorization.enabled', true)
E.set('workbench.colorCustomizations', {
  '[*]': {
    'editorBracketHighlight.foreground1': '#E6E6E6',
    'editorBracketHighlight.foreground2': '#FF75B5',
    'editorBracketHighlight.foreground3': '#19f9d8',
    'editorBracketHighlight.foreground4': '#B084EB',
    'editorBracketHighlight.foreground5': '#45A9F9',
    'editorBracketHighlight.foreground6': '#FFB86C',
    'editorBracketHighlight.unexpectedBracket.foreground': '#FF2C6D'
  }
})
E.set('editor.guides.bracketPairs', true)
E.set('editor.guides.highlightActiveIndentation', false)
E.set('editor.guides.bracketPairsHorizontal', true)

E.set('explorer.autoReveal', true)
E.set('editor.rulers', [120])
E.set('editor.tabSize', 2)

E.set('todohighlight.keywords', ['HERE', 'LOOK'])

// Fun stuff!
E.set('powermode.enabled', false)
E.set('editor.cursorBlinking', 'phase')
E.set('editor.snippetSuggestions', 'top')

//==================================================================================
//============================= Backup all the things! =============================
//==================================================================================

// Keep track of local file changes independent of source control.
//
// Every time you save an editor, a new entry is added to the list. From an entry you can: compare the changes to the
// local file or previous entry restore the contents delete or rename the entry
//
//
// Usage :: Cmd+Shift+P Local History: Find Entry to Restore
//
// OR: Open a file, then in the Explorer/Cmd+Shift+E, there is the “Timeline” view near the bottom, which has local history for the currently open file.
E.set('workbench.localHistory.enabled', true) // Controls whether the local file history is enabled.
E.set('workbench.localHistory.maxFileEntries', 1000) // Controls the maximum number of local file history entries per file. When the number of local file history entries exceeds this number for a file, the oldest entries will be discarded.
E.set('workbench.localHistory.maxFileSize', 1024) // Controls the maximum size of a file (in KB) to be considered for local history. Files that are larger will not be added to the local history.

//==================================================================================
//=================================== Formatting ===================================
//==================================================================================

E.set('[*]', { 'editor.formatOnSave': true })
E.set('[javascript][javascriptreact][typescript]', {
  'editor.defaultFormatter': 'vscode.typescript-language-features'
})
E.set('[html]', {
  'editor.defaultFormatter': 'vscode.html-language-features'
})
E.set('[json][jsonc]', {
  'editor.defaultFormatter': 'vscode.json-language-features'
})
E.set('[css][scss][less]', {
  'editor.defaultFormatter': 'vscode.css-language-features'
})
E.set('javascript.format.semicolons', 'remove')

E.set('editor.formatOnSave', true)
E.set('files.autoSave', 'afterDelay')

// ================================================================================
// Misc
// ================================================================================

// When enabled, the diff editor ignores changes in leading or trailing whitespace.
E.set('diffEditor.ignoreTrimWhitespace', true)

// Timeout in milliseconds after which diff computation is cancelled. Use 0 for no timeout.
E.set('diffEditor.maxComputationTime', 5000)

// ? Controls whether the editor should render the inline color decorators and color picker.
E.set('editor.colorDecorators', true)
let _x_ = 'green'

// If I invoke Cmd+F when I have some text selected, then I expect the Find&Replace to operate only on my selected region.
// Controls the condition for turning on find in selection automatically.
//  - never: Never turn on Find in selection automatically (default)
//  - always: Always turn on Find in selection automatically
//  - multiline: Turn on Find in selection automatically when multiple lines of content are selected.
E.set('editor.find.autoFindInSelection', 'multiline')

// Controls whether the cursor should jump to find matches while typing.
E.set('editor.find.cursorMoveOnType', true)

// Controls whether the search automatically restarts from the beginning (or the end) when no further matches can be found.
E.set('editor.find.loop', true)

// Controls whether the editor has code folding enabled.
E.set('editor.folding', true)

// Controls whether the editor should highlight folded ranges.
E.set('editor.foldingHighlight', true)

// Controls whether a space character is inserted when commenting.
E.set('editor.comments.insertSpace', true)

// Controls whether syntax highlighting should be copied into the clipboard.
E.set('editor.copyWithSyntaxHighlighting', true)

// Remove useless stuff
E.set('editor.minimap.enabled', false)
E.set('files.insertFinalNewline', false)
E.set('files.trimTrailingWhitespace', true)
