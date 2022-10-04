/** Welcome to your  init.js  file!
 *
 * Everything in this file, this JS program, is run whenever you open VSCode. (Assuming you have the
 * `easy - extensibility` package installed of-course!)
 *
 * This is useful for adding your own snippets, useful commands, to the `cmd + h` command pallet or for configuring
 * VSCode depending on the workspace, date, machine, etc.
 *
 *
 * IF YOU HAVEN'T ALREADY, INVOKE `CMD + H TUTORIAL` TO READ THE TUTORIAL FIRST!
 * - tldr: Cmd+E to evaluate a selection of code; Cmd+H to run commands from the user's personal pallete.
 *
 *
 * The current implementation treats the user's init file as if it were semi-dynamically-scoped: The `~/init.js` file
 * may mention `E, commands, vscode` with no ceremonial import of any kind!(This is similar to the use of the keyword
 * `this` in object - oriented programming: It's an implicitly introduced argument!)
 *
 * Below are sample fragments to help you get started; all the best!(More honestly, this is Musa's personal init.js
 * being shared with the world.)
 *
 * It is encouraged to keep this file under version control, then make a symbolic link;
 * e.g., `ln - s ~/my-cool-repo/init.js  ~/init.js`
 *
 * # A program is a literate work, written by a human & read by a human ---incidentally also by a machine.
 * - In VSCode, press “⌘+k ⌘+1” to fold everything up and get a nice outline view of everything here.
 * /

 //===================================================== Simple Starters ================================================

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
let welcome = `Welcome ${E.username()} on ${process.platform}! Today is ${E.date()}!`
let button = `A beautiful day to be alive 😃💐😁`
E.message(welcome, button)

/** “Fancy quotes” & smiles: Let's add a new command to the `cmd+h` command pallet.
 *
 * I like using unicode quotes, since `backticks` are not always approriate.
 */
commands['Enclose selection in unicode quotes'] = { 'cmd+i q': E => E.replaceSelectionBy(str => `“${str}”`) }

/** Unicode input wherever I go!
 *
 * I like using Unicode symbols, such as “⟦Σ xs⟧ ≈ xs.reduce( (x, y) => x + y, 0, xs)”.
 *
 * `yellpika.latex-input` is pretty good! Just press `\` then keep typing to see possible snippet completions.
 * - Works anywhere!
 * - E.g., \[[ ENTER ≈ \]]  Yields ⟦≈⟧  (any bracket completions // disappear whne pressing enter.)
 *
 * Similar remarks apply to `gao-shuhua.vsc-unicode-latex` ---which also has an online listing of all possible
 * completions. It also has interesting symbols, a larger set, but requires lots of typing: \openleftbracket just to
 * get ⟦.
 */
E.installExtension(`yellpika.latex-input`)

/** Bring some joy to my day upon startup. */
commands['Make me smile!'] = E => E.terminal('fortune | cowsay | lolcat')
// commands['Make me smile!'](E)

// Show me a motiviating poster, right inside VSCode.
commands['Positive Quote: Show it nicely!'] = async E => {
  let url = 'https://www.realsimple.com/work-life/life-strategies/inspiration-motivation/positive-quotes'
  let { data } = await axios.get(url)
  let first = x => (x ? x[1] : null)
  Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)]
  }
  let { src, alt } = data
    .match(/<img([^\>]*)\>/g)
    .map(img => ({ src: first(img.match(/data-src=(.*)/)), alt: first(img.match(/alt=(.*)/)) }))
    .filter(img => img.src && img.alt.startsWith(`"Positive motivating quotes`))
    .random()
  E.webPanel(
    alt,
    `<img style="display: block;margin-left: auto;margin-right: auto;width: 50%;" src=${src} width="800" height="800">`
  )
}

/** I'd like to get my “TODO” keywords highlighted, a trailing colon is required; e.g., TODO: FIXME:. */
E.installExtension('wayou.vscode-todo-highlight') // https://marketplace.visualstudio.com/items?itemName=wayou.vscode-todo-highlight

/** `Alt+q`: Pretty text!
 *
 * This extension semantically re-wraps comments that exceed the 120 column.
 * - Press `Alt+q` to do the rewrap editor-wide; or
 * - Select some text, then `Alt+q`.
 *
 * It understands comment markers and other markdown syntax. Then more!
 *
 * # Alt+q is configurable
 *
 * For example, I'd like whenever a paragraph is wrapped, for any lines that end in ".", "?" or "!", two spaces will be
 * added after that sentence when the paragraph is rewrapped. Neato! yeah buddo.
 *
 * Also, when I press `Alt+q` multiple times, then it wrap text according to each of my rulers. One of my rulers is set
 * at position 0, and made to (diss)appear transparently, so that wrapping to it provides an “infinite wrap length”.
 * But, if I want to wrap to a given column length, then I use `Ctrl+Shift+Q`.
 */
E.installExtension('stkb.rewrap') // https://marketplace.visualstudio.com/items?itemName=stkb.rewrap
E.set('rewrap.doubleSentenceSpacing', true) // ? This does not seem to work.
E.set('rewrap.autoWrap.enabled', true) // Auto-wrap my comment text when I type, the moment I exceed my dedicated ruler.
E.bindKey('ctrl+shift+q', 'rewrap.rewrapCommentAt') // Prompt me for a column-width to wrap all/selected comment text to;
// neato when sharing text.

/** Render vertical rulers after a certain number of monospace characters.
 *
 * Use multiple values for multiple rulers. No rulers are drawn if array is empty. */
E.set('editor.rulers', [
  120,
  { column: 0, color: '#0000' } // with alpha-channel 0 = transparent
])

// ================================================== Some nice extensions =============================================

/** Obtain an “eye” icon that toggles comment transparency. Sometimes you only want to focus on the code.
 *
 */
E.installExtension(`krembolabs.comment-styler`)

/** A tool for aligning the inline trailing comments.
 *
 * Does not play nice with inline overlays for JS inferred type annotations.
 */
E.installExtension(`huangbaoshan.comment-aligner`)

/** Obtain an new icon “<-//” that lets me style my code, any code, as if I were using a word processor!
 * Funky colours, various sizes, etc.
 *
 * Very useful when sharing screen, or sharing a screen shot, and want things to be emphasised.
 *
 * Warning! For 𝗯𝗼𝗹𝗱, 𝘪𝘵𝘢𝘭𝘪𝘤𝘴, u͟n͟d͟e͟r͟l͟i͟n͟e, 𝕠𝕦𝕥𝕝𝕚𝕟𝕖, your selected text is actually replaced by
 * the corresponding unicode. As such, the altertions persist and so it's best to only do this on comments!
 * However, font size and colours cannot be hidden in unicode and so are ignored when you share the file to a different
 * IDE, but are preserved in VSCode even if you open/close the file.
 */
E.installExtension(`krembolabs.comment-styler`)

/** Autohide the sidebar and terminal panel, whenever the user clicks into the text editor. */
E.installExtension(`sirmspencer.vscode-autohide`)

/** Get a nice sidebar, in the left-most area, for anchors or “documented bookmarks” to various locations in my files.
 *
 * Place anchors within comments or strings to place bookmarks within the context of your code. Anchors can be used to
 * track TODOs, write notes, create foldable sections, or to build a simple navigation making it easier to navigate your
 * files.
 *
 * There are `SECTION` anchors for deliminting a chunk into navigationable chunks, and `LINK` anchors that are followed
 * by a file (and optional line numer or anchor) that we can click to take us there.
 */
E.installExtension(`ExodiusStudios.comment-anchors`)
// ANCHOR This is an example anchor, neato!
// LINK init.js:12

//===================================================== Formatted Text =================================================

/** A program is a literate work, written by a human & read by a human ---incidentally also by a machine. This includes
 * not only code formatting, but also marked-up comments/design discussions.
 *
 * VSCode hovers will render markup such as code `name` or `age`, important _warnings_, and even more +important+
 * cruical *points* nicely. But in the comments, there is no such rendering.
 *
 * Likewise, I'd like the very first sentence of a JSDoc to act like a “chapter heading”, and likewise for `# whatever`
 * markdown-style subsection headers.
 *
 * Moreover, [formatted] text is not just about speaking *boldly* or _underscoring_ points that should be /emphasized/,
 * it can also be about ~fun-and-whimsy~; +lmaof+. Otherwise, it's all just `work`; e.g., “ This function has arguments
 * being a numeric `age` and a string `name` . ”
 */
E.decorateRegexp(/\*\* .*/, { backgroundColor: 'pink', remark: '**' }) // I want docstring “intro” sentences nicely coloured too!
E.decorateRegexp(/\*\s+#.*/, { backgroundColor: 'pink', remark: '#*' }) // Also colour doc subsection lines.
E.decorateRegexp(/\*[^ ]*\*/, { fontWeight: 'bold' }) // *Bold*
E.decorateRegexp(/_[^ ]*_/, { textDecoration: 'underline 2px' }) // Look _underline_ text!
// Comments are italics by default, so /slashes/ make text empahised by being normal font.
E.decorateRegexp(/\/[^ ]*\//, { fontStyle: 'normal' })
E.decorateRegexp(/\+[^ \+]*\+/, { textDecoration: 'line-through 2px' }) // +Strikethrough+ text
E.decorateRegexp(/`[^ $]*`/, { border: 'double', borderRadius: '3px', borderWidth: '2px' }, { disable: !true }) // `code`
E.decorateRegexp(/~[^ \n]*~/, { fontStyle: 'cursive', textDecoration: 'underline wavy 2px' }) // ~wave-to-the-moon~
// E.decorateRegexp(/[^\/]\[.[^ ]*\]/, { border: 'dashed', borderRadius: '3px', borderWidth: '2px' }) // [boxed]

/** Make "# Experimenting #" look like a solid pink button, with thick green text and a blue underline. I like to use
 * this to explicitly demarcate what chunk of code is stuff I'm experimenting with and may end-up deleting.  I like the
 * "#"-syntax since it's reminiscent of Markdown section markers.
 */
var pinkBoxStyle = {
  border: 'solid',
  borderRadius: '3px',
  borderWidth: '1px',
  letterSpacing: '1px',
  textDecoration: 'underline cyan 2px',
  color: 'green',
  fontWeight: 'bold',
  backgroundColor: 'pink'
}
E.decorateRegexp(/#.*#/, { ...pinkBoxStyle, remark: 'fenced' })

// =====================================================================================================================
/** Extension: Quickly Jumping to Favorited Webpages/Videos
 *
 *  Often, there are a number of Youtube videos, or webpages, that I'd like to jump to quickly. I'd like to have that
 * menu of items be right here in my editor. So, let's make some commands to do just that!
 */
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

/** Keeping data, URLs, in an auxilary `init.json` file.
 *
 * I have a bunch of URLs that I'd like to browse through eventually, and I'd like to have access to them from one
 * central location: My editor.
 * 1. I'd like to easily/mechanically add to my list of URLs, along with their dedicated topic.
 * 2. I'd like to easily/tersely declare commands to open my URLs nicely.
 *
 * So let's package up the above design pattern of "Youtube ~ Background audio while I'm working" into a utility.
 */

//! Move to VSCodeJS ---ASYNC
var HJSON = require('hjson')
var fs = require('fs')
E.withJSON = async (file, callback, newFile) => {
  file = file.replace(/~/g, process.env.HOME)
  try {
    let data = newFile ? {} : HJSON.parse(fs.readFileSync(file).toString())
    await callback(data)
    fs.writeFileSync(file, JSON.stringify(data, null, 2)) // Intentionally using JSON here.
  } catch (error) {
    console.error(`🤯 Oh no! ${error}`)
    console.error(callback.toString())
    process.exit(0)
  }
}

var makeBrowseCommand = (title, prompt = 'Which do you want to open?') => {
  commands[title] = E =>
    E.withJSON('~/easy-extensibility/init.json', async data => {
      let videos = data[title]
      const url = await E.readInput(prompt, videos)
      E.browseURL(url)
    })
}

// Here's two example new commands: They get the JSON URLs, display them nicely, let me pick one, then open it.
makeBrowseCommand(
  "Youtube ~ Videos I'd like to watch later / Iraqi Culture",
  'Which cultural tidbit do you want to learn about?'
)
makeBrowseCommand("Learning ~ Stuff I'd like to read", 'What do you want to (re)learn about?')

var axios = require('axios')
// Example: urlTitle('http://www.youtube.com/watch?v=jhvUqV3qeC0').then(E.message)
var urlTitle = async url => {
  let { data } = await axios.get(url)
  return data.match(/<title>([^<]*)<\/title>/)[1]
}

/*

  http://www.youtube.com/watch?v=jhvUqV3qeC0
*/
commands['Save URL from clipboard for later learning/watching/listening'] = async E =>
  await E.withJSON('~/easy-extensibility/init.json', async data => {
    let url = await E.clipboardRead()
    let title = await urlTitle(url)
    let topic = await E.readInput(
      'Where do you want to place this URL?',
      Object.keys(data).filter(x => x != 'README')
    )
    if (!data[topic]) data[topic] = {}
    data[topic][title] = url
    E.message(`${topic} got “${title}”`)
  })

// ? Make a new file “init.json” with the contents "{}".
E.withJSON(
  '~/easy-extensibility/init.json',
  data => (data.README = 'This file contains data for use in my ~/init.js file')
)

// We can stick our data in there, like this:
E.withJSON('~/easy-extensibility/init.json', data => {
  data['Youtube / Background'] = {
    'Daily Supplications': 'https://youtu.be/9m9yE7qtq5w',
    'Uncle Iroh': 'https://youtu.be/jhvUqV3qeC0',
    'Oh Hussain!': 'https://youtu.be/6EHroVqxWDo',
    'ASMR ~ Walking Vancouver': 'https://youtu.be/hL2NYxKGTts',
    'ASMR ~ Vancouver Cafe': 'https://youtu.be/7sg-dfYLGRQ'
  }
})

// ==================================================================================
// =============== Running arbitrary CLI programs on the current file ===============
// ==================================================================================

/** Running arbitrary CLI programs on the current file
 *
 * - I intentionally `cd` to the parent directory for those rare times when I have a file open outside of its workspace.
 * - I also make use of the `shift` modifier:
 *   + `cmd+h gulp` runs Gulp on the current file, whereas `shift+cmd+h gulp` runs Gulp on the entire repo.
 *   + `cmd+h playwright` runs my tests in headless mode, whereas `shift + cmd + h playwright` does so in headed mode.
 */
commands['File: Gulp tests!'] = E => {
  const cmd = E.currentPrefixArgument ? 'gulp precommit' : `npx gulp test-partial --file=${E.currentFileName()}`
  E.terminal(`cd ${E.currentDirectory()}; ${cmd}`, 'Gulp!')
}
commands['File: Playwright!'] = E => {
  const headed = E.currentPrefixArg ? '--headed' : ''
  E.terminal(` npx playwright test ${E.currentFileName()} ${headed}`)
}

/** Invoke `alt+shift+f` to `f`ormat the current active editor according to existing rules. For when I really want to
 * enforce a particular style. E.g., in a file that does not live in a repo with dedicated linting.
 */
commands['File: Prettify!'] = {
  'Alt+P': E => {
    const options = `--no-semi --print-width 120 --single-quote --trailing-comma none --arrow-parens avoid`
    E.shell(`prettier ${options} --write ${E.currentFileName()}`)
    E.message(`Prettified with options:  ${options}`)
  }
}

/** The default theme leaves much to be desired; so upon startup, let's have one of our favourite themes be chosen.
 *
 * - Note: Cmd+K Cmd+T to see all themes and try them out on-the-fly.
 * - 'Light Pink' is from extension: @id:mgwg.light-pink-theme
 */
// This should just be a thing. Get a random element from an array.
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)]
}
let themes = {
  'Solarized Light': 'vscode.theme-solarized-light',
  'Snazzy Operator': 'aaronthomas.vscode-snazzy-operator', // https://marketplace.visualstudio.com/items?itemName=aaronthomas.vscode-snazzy-operator
  'Light Pink': 'mgwg.light-pink-theme', // https://marketplace.visualstudio.com/items?itemName=mgwg.light-pink-theme
  'Noctis Lux': 'liviuschera.noctis', // https://marketplace.visualstudio.com/items?itemName=liviuschera.noctis
  'Noctis Lilac': 'liviuschera.noctis', // https://marketplace.visualstudio.com/items?itemName=liviuschera.noctis
  Hopscotch: 'idleberg.hopscotch' // https://marketplace.visualstudio.com/items?itemName=idleberg.hopscotch
}
Object.keys(themes).map(name => E.installExtension(themes[name])) // Install all themes
E.set('workbench.colorTheme', Object.keys(themes).random()) // Select a random one

// Cosmetics ===========================================================================================================

// Add a motavational motto to the VSCode frame window title
E.set('window.title', '${activeEditorLong} Living The Dream (•̀ᴗ•́)و')

// Make "=>, !=, ===, <=, >=, <>, etc" look like single-symbol Unicode!
E.set('editor.fontLigatures', true)

// A nice comfortable font, at a reasonable size.
E.set('editor.fontFamily', 'Fantasque Sans Mono')
E.set('editor.fontSize', 14)

// When I click on the explorer, I want it to show me the directory hierarchy focused on my current opened editor.
E.set('explorer.autoReveal', true)
E.set('editor.cursorBlinking', 'phase')

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

/** Sticky scroll shows the current scope at the top of the view port.
 *
 * If a scope's header, such as a function name, is out of view, show it to me near the top of the editor, as I scroll.
 */
E.set('editor.stickyScroll.enabled', true)

// =====================================================================================================================

/** A program is a literate work, written by a human & read by a human ---incidentally also by a machine.
 *
 * Consider a program to be written primarily to explain to another human what it is that we want the computer to do,
 * how it is to happen, and why we can believe that we have achievied our aim.
 * (The “another human” might be you in a few months time when the details have escaped your mind.)
 *
 * A program should not just compute, it should also motivate, justify & discuss.
 * This human nature makes it easier to follow, detect errors, use elsewhere, or extend.
 * After all, the larger part of the life of a piece of software is maintenance.
 *
 * Flawed programs with good discussion may be of more use in the development of related correct code,
 * than working code that has no explanation.
 *
 * In VSCode, press “⌘+k ⌘+1” to fold everything up and get a nice outline view of everything here.
 */

// =====================================================================================================================
// Below be uncommented/undiscussed dragons.

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
E.set('editor.copyWithSyntaxHighlighting', false)

// Remove useless stuff
E.set('editor.minimap.enabled', false)
E.set('files.insertFinalNewline', false)
E.set('files.trimTrailingWhitespace', true)

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

// =====================================================================================================================
// this essentially removes a lot of the distractions from your view in VS Code.
// (As always, toggle this with Cmd+Shift+P ---or Ctrl+X+Z)
// E.executeCommand('workbench.action.toggleZenMode')

//======================================================== Terminals ===================================================

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
 * Ctrl + Shift + ` to create a new terminal.
 */
// E.bindKey("ctrl+`", "workbench.action.terminal.toggleTerminal", "terminal.active")
// This is the default setup. Neato!
//
// What if I want to jump to the terminal, but be maximised?
// Easy: Ctrl+k `  open the lower pane then maximize/minimise it.
// (From here, Ctrl+` will bring me back to the editor, when terminal is maximised).
//
E.bindKey('ctrl+k `', 'workbench.action.toggleMaximizedPanel', 'true')

// Let's make Ctrl+ Shift+ ` open a new terminal in my editor.
// I have placed my terminal into a editor and treat is as just another tab. I usually have it pinned and wrap my tabs. But usually navigate to it via Cmd+P. If I want it visible I usually have split groups.
// I can quickly get back to it with Ctrl+XXX where XXX is the number, or “Cmd+P Bash”.
//
//
// Note that I don't make Ctrl+` open in the editor, since at work I use VSCode Tasks to open ~11 servers for local development.
// (Note to self: It might be be better to spawn child processes via NodeJS, and create a VSCode output channel, then have those processes spit out their content to that channel.)
// (This itself might be a)
E.set('terminal.integrated.defaultLocation', 'editor')

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

E.set('todohighlight.keywords', ['HERE', 'LOOK'])
E.set('editor.snippetSuggestions', 'top')
E.set('powermode.enabled', false)

/** [Terminals] The new theme key terminal.inactiveSelectionBackground is available to show a different selection
 * background color whether the terminal is focused or not to better align with the editor.
 */
E.set('terminal.inactiveSelectionBackground', true) // Need to update my VSCode for this to work.

// “m”y own extended version of the “f”ind files command.
//
/** Sometimes I wish to do a textual search in a directory that is not the current workspace.
 *
 * # Usage
 * 1. Select some text, then `cmd+m f` OR `cmd+h find dir`, joy!
 * 2. If no text is selected, you'll be get to the search pane and can enter text there.
 *
 * # Remarks
 * - This can be done by opening the directory I want in the file explorer, then right-clicking and selecting
 *   Find-in-Folder.
 * - That's too much for me!
 * - As such, I've made this handy-dandy utility.
 *
 * Moreover, it disables some stuff that I would usually want, such as regexp, case sensativity, and looking into
 * ignored locations. It's this extra bit that makes this utility handy, otherwise I could just `Cmd + Shift + F` then
 * enter the directory and search term manually.
 */
commands['Find in a given directory'] = {
  'cmd+m f': async E =>
    E.executeCommand('workbench.action.findInFiles', {
      query: E.selection(),
      filesToInclude: await E.readInput('Directory to search in:'),
      useExcludeSettingsAndIgnoreFiles: false,
      isRegex: false,
      isCaseSensitive: false,
      filesToExclude: './*.css'
    })
}

/** Edit CSV files with a nice table UI, akin to Excel.
 *
 * - Execute the command “edit as csv” to toggle between the table UI and the default CSV look.
 * - Not needed atm, I rarely play with CSV files.
 */
// E.installExtension('janisdd.vscode-edit-csv')

/** Get a smart backspace button; various other features! */
E.installExtension('jasonlhy.hungry-delete')
// Delete all vertical whitespace
E.bindKey('ctrl+backspace', 'extension.hungryDelete')

/* Printing objects on Node.js =========================================================================================
   var axios = require('axios') // Just for example, `posts`, below.
   var posts = await axios.get('https://jsonplaceholder.typicode.com/posts')

   // My current implementation, cmd+e's internalEchoFunction, crashes here:
   posts // Converting circular structure to JSON --> ...
   E.string(posts) // This fails too!

   // This approach works nicely!
   var util = require("util")
   util.inspect(posts, false, null) // A nice object

   // ? Maybe this is enough?
   E.string = obj => typeof obj == 'string'? obj : util.inspect(obj)
   E.string = obj => util.inspect(obj)

   var obj = {name: 'musa', act: x => x}

   E.message("huh?")         // This makes me see a Promise~object message! Make the echo message avoid this pending notice when we're dealing with E.message in-particular!
   await E.message("hello")
*/

// ? Note that Cmd+/ toggles comments, works nicely with selections.

// an example of transforming text.
function quoteSelection(quote = "\"", sep = " ") {
  let editor = vscode.window.activeTextEditor
  const document = editor.document
  const selection = editor.selection
  const replacement = document.getText(selection).split(" ").map(str => quote+str+quote).join(sep)
  editor.edit(editBuilder => editBuilder.replace(selection, replacement))
}

commands["Quote selection"] = E => quoteSelection()

commands["Quote selection with \" and separate with \",\""] = E => quoteSelection("\"", ", ")

commands["Quote selection with ' and separate with \",\""] = E => quoteSelection("'", ", ")
