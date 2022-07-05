// vscode, E, commands ================================================================================

const vscode = require('vscode')

/** User-defined commands that are invoked by `cmd+h`.
 *
 * This is a names-to-functions associations object.
 *
 * There are two ways to register commands for use with `cmd+h`:
 * 1. Invoke `cmd+e` on a region of code that begins with the keyword `function`; i.e.,
 *    evaluate a selection of text that happens to be a JavaScript function.
 *    ```
 *    // Run an arbitrary command-line function on the current file; namely prettier.
 *    function prettifyFile (E) { E.shell(`prettier --write ${E.currentFileName()}`) }
 *    ```
 * 2. Attach a function to the `commands` object:
 *    ```
 *    // Run an arbitrary command-line function on the current file; namely prettier.
 *    commands["Prettify current file"] = E => E.shell(`prettier --write ${E.currentFileName()}`)
 *    ```
 *
 * The second approach has the benefit of providing a user-friendly-name to the command
 * when it appears in the `cmd+h` command pallete; whereas the former uses whatever the function name happens to be.
 *
 * 🤔 Every function, attached in either of the two ways, must accept `E` and `vscode` as its first two arguments.
 * That is, `cmd+h` invokes functions within `commands` by providing them with two arguments `E, vscode`.
 * - As parameters, user's may use whatever names they like; e.g., `function shout (fancy, old) { fancy.message("HELLO") }`
 *   but we suggest the standard names instead: `function shout (E, vscode) { E.message("Hello") }`.
 */
const commands = {}

/** A high-level VSCode Extension API ---that is also user-friendly.
 *
 * The default `vscode` API is too low-level. Users are forced to worry about windows
 * and editor objects for the sake of inserting some text or retriving selected regions of text.
 *
 * Many methods attached to this API require an active editor. It's up to the user to ensure this
 * requirement is meet; e.g., in a function bound to `commands`, one should perform the a check along the lines of:
 * ```
 * let editor = vscode.window.activeTextEditor;
 * if (!editor) return; // No editor on which to operate, so exit.
 * ... // Otherwise, use `E.XYZ` methods here.
 * ```
 * This pattern is captured in `E.withEditor`.
 */
const E = {}

// Internal Configurations ================================================================================

/** Configurations of the `E` API; e.g., how evaluated text is shown is handled with `E.internal.echoFunction`. */
E.internal = {}
/** This function is called to decide how should evaluated text be shown by the `easy-extensibiliy`'s `cmd+E` keybinding.
 * - The default is to show a `E.message` of a given value `x` along with its type.
 * - Other useful functions include `E.overlay` or `E.insert`.
 */
E.internal.echoFunction = (x, typ = typeof x) => E.message(`${JSON.stringify(x)} ~ ${typ}`)

// String, Message, Error ================================================================================

/** Ensure input `x` is a string; if it's not, then stringify it. */
E.string = x => (typeof x === 'string' ? x : JSON.stringify(x))

/** Show JavaScript item `it` in a VSCode information notification; `it` is ensured to be a `E.string`.
 *
 * Optionally, `buttons` is an array of strings that are used as buttons; the result of the `E.message` is a thennable
 * that refers to the user's button click, if any.
 *
 * #### Examples
 * ```
 * // Common usage
 * E.message("Hello, world!")
 *
 * // Usage with 2 buttons
 * E.message("Are you doing well?", "Super duper", "No, not really")
 * .then(response => response == "Super duper" ? E.message("Yay 😊") : E.error("I'm here for you 🫂"))
 * ```
 * ### See also
 * `E.warning`, `E.error`, `E.overlay`, `E.insert`.
 */
E.message = (it, ...buttons) => vscode.window.showInformationMessage(E.string(it), ...buttons)

/** Show JavaScript item `it` in a VSCode warning notification; `it` is ensured to be a `E.string`.
 *  - See the documentation for `E.message` regarding similar example uses.
 */
E.warning = (it, ...buttons) => vscode.window.showWarningMessage(E.string(it), ...buttons)

/** Show JavaScript item `it` in a VSCode error notification; `it` is ensured to be a `E.string`.
 *  - See the documentation for `E.message` regarding similar example uses.
 */
E.error = (it, ...buttons) => vscode.window.showErrorMessage(E.string(it), ...buttons)

/**  Insert text at current cursor position;  `it` is ensured to be a `E.string`. */
E.insert = it => {
  const editor = vscode.window.activeTextEditor
  if (editor) editor.edit(editBuilder => editBuilder.insert(editor.selection.active, E.string(it)))
}

// Selections ================================================================================

/** Get the current line number as, well, a number. */
E.currentLineNumber = () => vscode.window.activeTextEditor.selection.active.line + 1
// Implementation note: Internally, vscode uses zero-indexing and so the number the user sees is one-off from the internal
// number, so we adjust that with a +1. Note: null + 1  ==  1

/** Get the contents of line `n` as a string. */
E.lineAt = n => vscode.window.activeTextEditor.document.lineAt(Math.max(0, n - 1)).text
// Implementation note: Internally, vscode uses zero-indexing and so the number the user sees is one-off from the internal
// number, so we adjust that with a -1.

/** Get the current line's contents as a string. */
E.currentLine = () => E.lineAt(E.currentLineNumber())

/** Get selected region, as string. */
E.selection = () => {
  let editor = vscode.window.activeTextEditor
  const document = editor.document
  const selection = editor.selection
  return document.getText(selection)
}

/** Replaced the selected region with the given string `str`. */
E.replaceSelection = str => {
  let editor = vscode.window.activeTextEditor
  const selection = editor.selection
  editor.edit(editBuilder => editBuilder.replace(selection, str))
}

/** Replace the selected text `X` by the result of `f(X)`. */
E.replaceSelectionBy = f => E.replaceSelection(f(E.selection()))

/** Retrieve current selected region if it contains non-whitespace, otherwise get the entirety of the current line. */
E.selectionOrEntireLine = () => {
  let text = E.selection().trim()
  if (text.length === 0) text = E.currentLine().trim()
  return text
}

// currentFileName, shell ================================================================================

/** Get the name of the current file, editor, as a string.
 *
 * For example, within my `~/init.js` pressing `cmd+e` on the following:
 * ```
 * E.currentFileName() //  ⇒  /Users/musa/init.js
 * ```
 */
E.currentFileName = () => vscode.window.activeTextEditor.document.fileName

/** Run a shell command and get the result as promised object of `{stdout: string, stderr: string}`.
 *
 * #### Examples
 * ```
 * // Who is the current user?
 * E.shell('whoami').then(x => E.message(x.stdout))
 *
 * // Run an arbitrary command-line function on the current file; namely prettier.
 * E.shell(`prettier --write ${E.currentFileName()}`)
 * ```
 */
E.shell = require('util').promisify(require('child_process').exec)

/** Create a new terminal, within VSCode, that runs the given string command `cmd`.
 *  Title the resulting terminal with the given `title` string.
 *
 *  Result value is of type `vscode.Terminal`.
 */
E.terminal = (cmd, title = cmd) => {
  let t = vscode.window.createTerminal(title)
  t.sendText(cmd)
  t.show(true) // Ensure terminal is showing, but don't force focus to jump here!
  return t
}

// Toggles ================================================================================

/** Executes the command denoted by the given command identifier.
 *
 * #### Usage Instructions
 * 1. Press `Cmd+Shift+P`, find your desired command, then click on the gear icon next to its title.
 * 2. Now you are in a keyboard shortcuts settings page, right click on the command title and select
 *    `Copy Command ID`.
 * 3. Now you can use `E.executeCommand(...)`, and paste whatever you copied into the `...` position.
 *
 * #### Example
 * ```
 * // Show every key stroke I press in a nice large pane near the middle-bottom of my screen!
 * E.executeCommand('workbench.action.toggleScreencastMode')
 * ```
 */
E.executeCommand = vscode.commands.executeCommand

/** Execute `callback` on the current active editor, if any; otherwise return `null`.
 *
 * #### Example
 * ```
 * // Disable line numbers in the currently active editor
 * E.withEditor(e => e.options.lineNumbers = 0)
 * ```
 */
E.withEditor = callback => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return
  return callback(editor)
}

/** A toggling mechanism that is more unfirm that the defaults and is larger.
 *
 * The default vscode API provides inconsistently named toggeling commands,
 * such as
 * - `workbench.action.togglePanel`
 * - `workbench.action.toggleStatusbarVisibility`
 * - `workbench.action.toggleActivityBarVisibility`
 * The first is inconsistent with the latter two since it does not mention the suffix `Visibility`,
 * and the latter two are inconsistent amongst themselves with regards to casing: `Statusbar` and not `StatusBar`.
 *
 * This collection of toggle functions are all camelCase ---notably `statusBar` and `activityBar`, for the sake of consistency.
 *
 * This collection is larger since it includes things such as toggles for line numbers and cursor styles.
 */
E.toggle = {
  /** Show every key stroke I press in a nice large pane near the middle-bottom of my screen? */
  screencast: () => E.executeCommand('workbench.action.toggleScreencastMode'),

  /** Toggle whether we are in fullscreen mode or not. */
  fullscreen: () => E.executeCommand('workbench.action.toggleFullScreen'),

  /** Toggle the visibility of the bottom-most panel (with Problems, Output, Terminal, etc). */
  panel: () => E.executeCommand('workbench.action.togglePanel'),

  /** Hide all editors; show only panel; useful when want to focus on panel; cmd+j to bring back editors. */
  editors: () => E.executeCommand('workbench.action.toggleEditorVisibility'),

  /** Example usage:  `E.toggle.sidebar(true); E.toggle.sidebar()`  where the first moves position, then the second makes it visible. */
  sideBar: presenceOrPosition =>
    E.executeCommand(`workbench.action.toggleSidebar${presenceOrPosition ? 'Position' : 'Visibility'}`),

  /** Show the bottom-most mode-line, which displays things like line-number, branch name, etc? */
  statusBar: () => E.executeCommand('workbench.action.toggleStatusbarVisibility'),

  /** Toggle the visibility of the left-most panel; which mentions `Source Control`, `Extensions`, etc. */
  activityBar: () => E.executeCommand('workbench.action.toggleActivityBarVisibility'),

  // Hide tabs; navigate between tabs via C-x <-/->
  tabs: () => E.executeCommand('workbench.action.toggleTabsVisibility'),

  breadcrumbs: () => E.executeCommand('breadcrumbs.toggle'),

  /** Either toggle line numbers on or off.
   *
   * When `n` is provided, it can be one of the following *numeric* values:
   * 0 off; 1 on; 2 relative.
   */
  lineNumbers: n => E.withEditor(e => (e.options.lineNumbers = n || +!e.options.lineNumbers)),

  /** Either toggle the cursor style between the default thick line and the underline cursor.
   *
   * When `n` is provided, it can be one of the following *numeric* values:
   * 1 thick line; 2 filled block; 3 underline; 4 thin line; 5 block outline; 6 thin underline.
   */
  cursorStyle: n => E.withEditor(e => (e.options.cursorStyle = n || e.options.cursorStyle === 1 ? 3 : 1)),

  /** Instead of seeing typos in the `Problems` pane in the bottom-most panel, toggle whether they should be shown inline.
   * [This requires the `Error Lens` extension by user `Alexander`.]
   */
  errorLens: () => E.executeCommand('errorLens.toggleError'),

  /** Should spelling mistakes be shown inline, along with suggestions?
   * [This requies the `Code Spell Checker` extension by user `Street Side Software`.]
   */
  spellChecking: () => E.executeCommand('cSpell.toggleEnableSpellChecker'),

  /** Toggle whether the active editor should occupy the center of the screen; with whitespace on the sides. */
  centeredLayout: () => E.executeCommand('workbench.action.toggleCenteredLayout'),

  /** Toggle whether there is a tiny map showing an overview of the code and your current location in it. */
  minimap: () => E.executeCommand('editor.action.toggleMinimap'),

  /** Should whitespace be shown as (uneditable) dots? */
  showWhitespace: () => E.executeCommand('editor.action.toggleRenderWhitespace')
}

// init.js ================================================================================

/** Opens a given file `path` string in the current VSCode instance.
 * - Since this is async, it takes a second sometimes.
 *
 * #### Example Usage
 * ```
 * E.findFile("~/Downloads/woah.js")
 * ```
 */
E.findFile = path => E.shell(`code ${path}`)

commands["Open the tutorial; I'd like to learn more about using cmd+E!"] = E => {
  E.shell(
    'rm ~/Downloads/tutorial.js; curl -o ~/Downloads/tutorial.js https://raw.githubusercontent.com/alhassy/easy-extensibility/main/tutorial.js'
  )
  E.findFile('~/Downloads/tutorial.js')
}

commands["Find user's ~/init.js file, or provide a template"] = E =>
  E.shell('file ~/init.js').then(resp => {
    if (resp.stdout.includes('cannot open'))
      E.shell('curl -o ~/init.js https://raw.githubusercontent.com/alhassy/easy-extensibility/main/init.js')
    E.findFile('~/init.js')
  })

/** Returns a promise to have read the file at the given `path`; either the promise resolves to a string or null.
 * #### Examples
 * ```
 * // Using an absolute path
 * E.readFile('Users/musa/init.js').then(x => E.message(x))
 *
 * // Using a relative path
 * E.readFile('~/init.js').then(E.message)
 *
 * // Evaluating file contents; dangerous. Useful for dynamically-scoped programming.
 * E.readFile('~/init.js').then(eval)
 * ```
 */
E.readFile = path => ({
  then: f => require('fs').readFile(path.replace(/~/g, process.env.HOME), 'utf8', (err, data) => f(data))
})

//!! After `E` has been sufficiently defined, we load the user's `~/init.js` file.
//!! The current implementation treats the user's init file as if it were dynamically-scoped:
//!! The `~/init.js` file may mention `E, commands, vscode` with no ceremonial import of any kind!
//!! (This is similar to the use of the keyword `this` in object-oriented programming: It's an implicitly introduced argument!)

commands['Reload ~/init.js file'] = E => {
  E.readFile('~/init.js').then(text => {
    // Rather than just `eval(text)`, the following allows users to make use of `await` clauses liberally.
    // That is, the user's `~/init.js` file can make liberal use of `await` clauses as a syntactic sugar for an ambient async IIFE.
    eval(`(async () => { ${text} })()`)
    E.message('~/init.js loaded!')
  })
}

//!! Actually load the file upon startup!
commands['Reload ~/init.js file'](E)

// ================================================================================

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('easy-extensibility.evaluateSelection', () => {
      // To evaluate the current selection, we need an active editor.
      // For the exact depenency, see the implementation of `E.selection`.
      let editor = vscode.window.activeTextEditor
      if (!editor) return

      let text = E.selectionOrEntireLine()
      // Rather than just `eval(text)`, the following allows users to make use of `await` clauses liberally.
      // That is, `cmd+e` allows liberal use of `await` clauses as a syntactic sugar for async IIFEs.
      // let result = eval(`(async () => { return ${text} })()`)
      //  let result = eval(`(async () => ${text} )()`)
      // let result = eval(`${text}`)

      let result

      if (text.startsWith('function') || text.startsWith('async function')) {
        result = new Function('return ' + text)()
        commands[result.name] = result
        E.internal.echoFunction(result.name, 'function')
        return
      } else if (text.includes('await ')) result = eval(`(async () => { ${text} })()`)
      else result = eval(text)

      // Don't bother echoing void output.
      if (text.includes('E.message') || text.includes('E.insert')) return

      E.internal.echoFunction(result)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('easy-extensibility.executeRegisteredCommand', async () => {
      let options = { placeHolder: 'Pick a command ' }
      const result = await vscode.window.showQuickPick(Object.keys(commands), options)
      if (result) {
        E.message(`Executing ${result}...`)
        commands[result](E, vscode)
      }
    })
  )
}

module.exports = {
  activate,
  deactivate: () => {}
}
