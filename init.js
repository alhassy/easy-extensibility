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
// The `~/.init.js` file may mention `E, commands, vscode` with no ceremonial import of any kind!
// (This is similar to the use of the keyword `this` in object-oriented programming:
//  It's an implicitly introduced argument!)

// Below are sample fragments to help you get started; all the best!
// (More honestly, this is Musa's personal init.js being shared with the world.)

// It is encouraged to keep this file under version control, then make a symbolic link;
// e.g.,   ln  -s  ~/my-cool-repo/init.js  ~/.init.js

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

//===================================================== Formatted Text =================================================

/** A program is a literate work, written by a human & read by a human ---incidentally also by a machine.
 * This includes not only code formatting, but also marked-up comments/design discussions.
 *
 * VSCode hovers will render markup such as code `name` or `age`, important _warnings_, and
 * even more +important+ cruical *points* nicely. But in the comments, there is no such rendering.
 * Let's fix that!
 */
E.decorateRegexp(/\*[^ ]*\*/, { fontWeight: 'bold' }) // *Bold*
E.decorateRegexp(/_[^ ]*_/, { textDecoration: 'underline 2px' }) // Look _underline_ text!
// Comments are italics by default, so /slashes/ make text empahised by being normal font.
E.decorateRegexp(/\/[^ ]*\//, { fontStyle: 'normal' })
E.decorateRegexp(/\+[^ ]*\+/, { textDecoration: 'line-through 2px' }) // +Strikethrough+ text
E.decorateRegexp(/`[^ ]*`/, { border: 'double', borderRadius: '3px', borderWidth: '2px' }) // `code`

/** [Formatted] text is not just about speaking *boldly* or _underscoring_ points
 *  that should be /emphasized/, it can also be about ~fun-and-whimsy~; +lmaof+.
 *  Otherwise, it's all just `work`; e.g.,
 *   “ This function has arguments being a numeric `age` and a string `name` . ”
 */
E.decorateRegexp(/~[^ ]*~/, { fontStyle: 'cursive', textDecoration: 'underline wavy 2px' }) // ~wave-to-the-moon~ friends!
E.decorateRegexp(/\[.[^ ]*\]/, { border: 'dashed', borderRadius: '3px', borderWidth: '2px' }) // [boxed]

// Make "# Experimenting #" look like a solid pink button, with thick green text and a blue underline.
// I like to use this to explicitly demarcate what chunk of code is stuff I'm experimenting with and may end-up deleting.
// I like the "#"-syntax since it's reminiscent of Markdown section markers.
E.decorateRegexp(/#.*#/, {
  border: 'solid',
  borderRadius: '3px',
  borderWidth: '1px',
  letterSpacing: '1px',
  textDecoration: 'underline cyan 2px',
  color: 'green',
  fontWeight: 'bold',
  backgroundColor: 'pink'
})

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

commands["Learning ~ Stuff I'd like to read"] = async E => {
  let topics = {
    'VSCode / Development Workflows': 'https://egghead.io/courses/development-workflows-in-vscode',
    'Archives / VSCode / Keyboard shortcuts to become a VS Code ninja':
      'https://blog.logrocket.com/learn-these-keyboard-shortcuts-to-become-a-vs-code-ninja/',
    'VSCode / Basics ~ Egghead': 'https://egghead.io/courses/vscode-basics',
    'VSCode / How to debug Playwright tests':
      'https://medium.com/@anastasiya.mazheika/how-to-debug-playwright-tests-in-vscode-fa0126d9162f',
    'VSCode / JavaScript Programming': 'https://code.visualstudio.com/docs/languages/javascript#_code-actions-on-save',
    'VSCode / Refactoring source code in Visual Studio Code': 'https://code.visualstudio.com/docs/editor/refactoring',
    'VSCode / QA / 5 VSCode Extensions I Use Daily to Manage My Remote Teams | by Ben Newton | Geek Culture | Medium':
      'https://medium.com/geekculture/5-vscode-extensions-i-use-daily-to-manage-my-remote-teams-21d098c2f702',
    'VSCode / QA / Jira in vscode': 'https://marketplace.visualstudio.com/items?itemName=Atlassian.atlascode',
    'VSCode / How to Set Up VS Code Like a Pro in Just 5 Minutes | by Dr. Derek Austin 🥳 | Better Programming':
      'https://betterprogramming.pub/how-to-set-up-vs-code-like-a-pro-in-just-5-minutes-65aaa5788c0d',
    'VSCode / Best VSCode Themes: Top 15 Themes For Visual Studio Code | SPEC INDIA':
      'https://www.spec-india.com/blog/vscode-themes',

    'JS / Async / Asynchronous iteration • JavaScript for impatient programmers (ES2022 edition)':
      'https://exploringjs.com/impatient-js/ch_async-iteration.html',
    'JS / Async / Asynchronous programming in JavaScript • JavaScript for impatient programmers (ES2022 edition)':
      'https://exploringjs.com/impatient-js/ch_async-js.html',
    'JS / Async / Async functions • JavaScript for impatient programmers (ES2022 edition)':
      'https://exploringjs.com/impatient-js/ch_async-functions.html',
    'JS / Async / Promises for asynchronous programming [ES6] • JavaScript for impatient programmers (ES2022 edition)':
      'https://exploringjs.com/impatient-js/ch_promises.html',
    'JS / JS Visualizer 9000': 'https://www.jsv9000.app/',
    'JS / Async / Asynchronous programming in JavaScript • JavaScript for impatient programmers (ES2022 edition)':
      'https://exploringjs.com/impatient-js/ch_async-js.html',
    'JS / Async / Async functions • JavaScript for impatient programmers (ES2022 edition)':
      'https://exploringjs.com/impatient-js/ch_async-functions.html',
    'JS / Error handling': 'https://javascript.info/error-handling',
    'JS / Async / Handling Async Operations in Node.js | by Prachi | JavaScript in Plain English':
      'https://javascript.plainenglish.io/how-nodejs-works-event-loop-handling-async-operation-4bfc2781110f',
    'JS / Async / Javascript Async Fundamentals': 'https://www.netguru.com/blog/javascript-async-fundamentals',

    'Algos / RapidAPI Learn': 'https://rapidapi.com/learn',
    'Algos / Algorithm Visualizer': 'https://algorithm-visualizer.org/',

    'Git / Standup': 'https://dev.to/joeljuca/git-standup-25gm ',
    'Git / more standup': 'https://levelup.gitconnected.com/how-to-use-git-as-a-standup-tool-8e363013cd9a',
    'Git / even more git standup': 'https://github.com/kamranahmedse/git-standup',
    'Git / yet more git standup': 'https://github.com/tj/git-extras/blob/master/Commands.md#git-standup',
    'Git / Learn Git Branching': 'https://learngitbranching.js.org/',

    'CSS / CSS-Tricks - Tips, Tricks, and Techniques on using Cascading Style Sheets': 'https://css-tricks.com/',
    'HTML / HTML For Beginners The Easy Way: Start Learning HTML & CSS Today': 'https://html.com/',

    'QA / dev metrics': 'https://waydev.co/software-development-metrics/',
    'QA / How to prevent code reviews from slowing down your team':
      'https://www.sheshbabu.com/posts/how-to-prevent-code-reviews-from-slowing-down-your-team/',
    'QA / Speed up your code reviews using ESLint and Prettier':
      'https://www.sheshbabu.com/posts/speed-up-your-code-reviews-using-eslint-and-prettier/',
    'QA / Why Meetings Cost More than MacBook Pros - the Business Case for Fewer Developers in Meetings : r/programming':
      'https://www.reddit.com/r/programming/comments/ujpxmy/why_meetings_cost_more_than_macbook_pros_the/',

    'Misc / GREX!!! Rewritten in Rust: Modern Alternatives of Command-Line Tools':
      'https://zaiste.net/posts/shell-commands-rust/'
  }
  const url = await E.readInput('What do you want to (re)learn about?', topics)
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

// This should just be a thing. Get a random element from an array.
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)]
}

/** The default theme leaves much to be desired; so upon startup, let's have one of
 * our favourite themes be chosen.
 *
 * - Note: Cmd+K Cmd+T to see all themes and try them out on-the-fly.
 * - 'Light Pink' is from extension: @id:mgwg.light-pink-theme
 */
let themes = ['Solarized Light', 'Snazzy Operator', 'Light Pink', 'Noctis Lux', 'Noctis Lilac', 'Hopscotch']
E.set('workbench.colorTheme', themes.random())

/** colors-as-types!
 *
 * Coding with a Fruit Salad: Semantic Highlighting
 *
 * What should be highlighted when we write code? Static keywords with fixed uses, or dynamic user-defined names?
 *
 * “Syntax” highlighting ⇨ Specific words are highlighted in strong colours so that the structure can be easily gleaned.
 * - Generally this only includes a language's keywords, such as “if, loop, begin, end, cond”.
 * - User defined names generally share one colour; usually black.
 * - Hence, an “if” block may be seen as one coloured keyword followed by a blob of black text.
 * - *Obvious keywords are highlighted while the rest remains in black!*
 *
 * “Semantic” highlighting ⇨ Identifiers obtain unique colouring.
 * - This makes it much easier to visually spot dependencies with a quick glance.
 * - One can see how data flows through a function.
 * - In dynamic languages, this is a visual form of typing: Different colours are for different names.
 * - Especially helpful for (library) names that are almost the same.
 */
E.executeCommand('semantic-highlighting.toggleSemanticHighlights') // Extension: Semantic highlighting by malcolmmielle

// https://code.visualstudio.com/docs/languages/javascript#_inlay-hints
E.set('javascript.inlayHints.parameterNames', 'all')
E.set('javascript.inlayHints.variableTypes.enabled', true)

// Snippets:
// Quickly create JSDoc comments for functions by typing
// /** before the function declaration, and select the JSDoc comment snippet suggestion.
// You can optionally even use the type information from JSDoc comments to type check your JavaScript.
//
// Example
// The following pragma enables typechecking for JS, using JSDocs to get types.
//@ts-check
/**
 *
 * @param {number} x
 * @param {number} y
 */
function add(x, y) {
  return x + y
}
add(1, 'nope') // This should now show as an error!

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

/** Keep track of local file changes independent of source control: Every time you save an editor, a new entry is added
 * to the list.
 *
 *  Let's keep old versions since there's disk space to go around ---what am I going to do with 500gigs when nearly all
 *  my ‘software’ is textfiles 😼 Whenever ‘I need space,’ then I simply empty the backup directory, if ever.
 *
 * Why backups? Sometimes I may forget to submit a file, or edit, to my version control system, and it'd be nice to be
 * able to see a local automatic backup.
 *
 * From an entry you can: compare the changes to the local file or previous entry, restore the contents, delete or
 * rename the entry. The global commands to work with local history:
 * - workbench.action.localHistory.create - Create a new history entry for the active file with a custom name.
 * - workbench.action.localHistory.deleteAll - Delete all history entries across all files.
 * - workbench.action.localHistory.restoreViaPicker - Find a history entry to restore across all files.
 * - Or just:  Cmd+Shift+P Local History: Find Entry to Restore
 * - Or open a file, then in the Explorer, there is the “Timeline” view near the bottom,
 *   which has local history for the currently open file.
 *
 * [Save ≈ Backup] It is intestesting to note that we could easily make our own backup system, had VSCode lacked one, by
 * having a function simply save copies of our file ---on each save--- where the filename is augmented with a timestamp.
 */
E.set('workbench.localHistory.enabled', true)
// Only keep the last 1000 backups of a file. Silently delete execess backup versions.
E.set('workbench.localHistory.maxFileEntries', 1000)
// Controls the maximum size of a file (in KB) to be considered for local history.
// Files that are larger will not be added to the local history.
E.set('workbench.localHistory.maxFileSize', 1024)

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

// Stuff to move over to vscode.js =====================================================================================

/** Create a new editor, setting its language, initial content, and file name. Possibly open an existing file.
 *
 * @return A promise that opens a new {@link TextEditor editor}.
 * @param options A configuration of possible options for thew new file, including:
 *   - When `content` is `null`, you get the classic VSCode "Select a language, or start typing..." transient placeholder text.
 *      - If there already exists a file with the given `name`, then we open it and *append* the given content to it.
 *   - `column` A view column in which the new editor should be shown. Defaulting to 0.
 *   - `preserveFocus` When `true` the editor will not take focus.
 *
 * - If `name` is provided, then an actual file is created ---this is to avoid VSCode's annoying "Save" dialog boxes!
 *   - If there's already a file named by `name`, then that file is opened instead.
 *
 * ### Examples
 * ```
 * // Create a new empty editor, with the usual "Select a language, or start typing..." transient placeholder text.
 * await E.newEditor()
 *
 * // Create a new editor showing the results of a shall command, but leave focus in the current editor
 * await E.newEditor({preserveFocus: true, content: E.shell("ls") })
 *
 * // Make a new empty editor, prefixed `Untitled`, whose underlying file is a temporary file.
 * // * Useful to avoid "Save dialog" when closing resulting editor.
 * E.newEditor({ name: E.shell(`mktemp -t Untitled`), content: E.shell('ls') })
 *
 * // Create a new editor, but set the language and provide some initial text
 * await E.newEditor({language: "latex", content: String.raw`\large{Hello, world!}`})
 *
 * // Create a new editor, and save it to disk ---with no prompt!
 * await E.newEditor({name: "~/Downloads/example.js", content: "console.log('hiya!')"})
 *
 * // Open existing file (due to above line), and this time append conntent to it!
 * await E.newEditor({name: "~/Downloads/example.js", content: "console.log('hiya!')"})
 * ```
 */
E.newEditor = async (options = { language: 'text', content: null, name: null, column: 0, preserveFocus: false }) => {
  if (options.preserveFocus) {
    await E.executeCommand('workbench.action.splitEditorRight')
  }
  if (options.name) {
    E.shell(`touch ${options.name}`)
    await vscode.window.showTextDocument(vscode.Uri.file(options.name.replace(/~/g, process.env.HOME)))
    await E.endOfEditor()
    E.insert(options.content)
    if (options.preserveFocus) await E.otherEditor()
    return
  }
  let document = await vscode.workspace.openTextDocument(options)
  vscode.window.showTextDocument(document, options.column, options.preserveFocus)
  if (options.preserveFocus) await E.otherEditor()
}

/** Switch focus to the other/next open editor.
 *
 * ### Example Usage
 * ```
 * // Split the view, but keep focus here:
 *  await E.executeCommand('workbench.action.splitEditorRight'); E.otherEditor()
 * ```
 */
E.otherEditor = () => E.executeCommand('workbench.action.navigateEditorGroups')

// TODO: vscode.js should make endOfEditor actually go to the end, not just the final line!
// ie, go to last line AND last column
/** Move cursor to the last line of the editor. */
E.endOfEditor = () => E.executeCommand('cursorBottom')

/** Get the next word, from the current curosr position.
 * This does not get the entire word when the cursor is in the middle of it.
 *
 * @returns {string}
 *
 * ### Example usage
 * ```
 * commands["Echo word"] = { "alt+.": async E => E.message(await E.currentWord()) }
 * ```
 * Now press `alt+.` a few times and see what you see.
 */
E.currentWord = async () => {
  await E.executeCommand('cursorWordStartRightSelect')
  let word = E.selection()
  E.executeCommand('cancelSelection')
  return word
}

// Define word at point ================================================================================================

/** Show me the definition of a word, in a new pane to the right.
 * Leave focus in the current pane.
 */
commands['Define word'] = {
  'alt+.': async E => {
    let word = await E.currentWord()
    var def = E.shell(`dict ${word}`)
    let content = `---Overview of “${word.trim()}”; Press Cmd+W to exit---\n\n ${def}`
    E.newEditor({ name: E.shell(`mktemp -t Dictionary`), content, preserveFocus: true })
  }
}

// this essentially removes a lot of the distractions from your view in VS Code.
// (As always, toggle this with Cmd+Shift+P ---or Ctrl+X+Z)
E.executeCommand('workbench.action.toggleZenMode')
