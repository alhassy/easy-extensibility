/** A high-level VSCode Extension API ---that is also user-friendly.
 *
 * The default `vscode` API is too low-level. Users are forced to worry about windows
 * and editor objects for the sake of inserting some text or retriving selected regions of text.
 *
 * ### Example Usage
 * ```
 * // In your extension.js you would have:
 * const vscode = require('vscode')
 * const E = require('vscodejs')(vscode)
 * ```
 *
 * ### Active Editors
 * Many methods attached to this API require an active editor. It's up to the user to ensure this
 * requirement is meet; e.g., depending on the context, one may need to perform a check along the lines of:
 * ```
 * let editor = vscode.window.activeTextEditor;
 * if (!editor) return; // No editor on which to operate, so exit.
 * ... // Otherwise, use `E.XYZ` methods here.
 * ```
 * This pattern is captured by `E.withEditor`.
 */

// VSCodeJS is a language whose runtime is easy-extensibility, a VSCode extension.

module.exports = vscode => {
  const E = {}

  // Prefix Arguments ================================================================================

  /** Commands invoked with `cmd+h` may provide variations on their behaviour by casing on this value.
   *
   * ### Example Usage
   * ```
   * commands["speak"] = E => E.currentPrefixArgument ? E.error("HELLO") : E.message("Hi")
   * ```
   * Now we have **two commands for the price of one**:
   * 1. `cmd+h speak` will show *Hi* in a message notification.
   * 2. `shift+cmd+h speak` will show *HELLO* in a red error notification.
   *
   * ### This is more than just a toggle
   * Users may wish to pass arbitrary numeric values to commands, and so commands can have arbitary variations.
   * For instance, a user might add the following keybinding declaration to their VSCode settings, so that
   * `shift+5 cmd+h` will invoke a command and temporarily set `E.currentPrefixArgument` to 5.
   * ```
   * {
   *       "command": "easy-extensibility.executeRegisteredCommand",
   *       "mac": "shift+5 cmd+h",
   *       "when": "editorTextFocus",
   *       "args": 5
   * }
   * ```
   * You can then *see* this in-action by invoking the following command with `cmd+h hi`, `shift+cmd+h hi`, and `shift+5 cmd+h hi`.
   * ```
   * commands["hi"] = E => E.message("Hi ~ " + E.currentPrefixArgument)
   * ```
   *
   * ### Brevity & Symmetry
   *
   * For brevity, this extension only defines the binding `shift+cmd+h` which sets `E.currentPrefixArgument = 1`
   * then invokes the usual `cmd+h`. For other values for `E.currentPrefixArgument`, users may alter their personal
   * keybindings, as shown above.
   *
   * For the sake of symmetry, this extension declares the binding `shift+cmd+e`.
   * - It does not involve `E.currentPrefixArgument` at all.
   * - `cmd+e` shows the result of evaluating a selection, or the current line;
   * - `shift+cmd+e` inserts the result on a newline.
   */
  E.currentPrefixArgument = undefined

  // Internal Configurations ================================================================================

  /** Configurations of the `E` API; e.g., how evaluated text is shown is handled with `E.internal.echoFunction`. */
  E.internal = {}
  /** This function is called to decide how should evaluated text be shown by the `easy-extensibiliy`'s `cmd+E` keybinding.
   * - The default is to show a `E.message` of a given value `x` along with its type.
   * - Other useful functions include `E.overlay` or `E.insert`.
   */
  E.internal.echoFunction = (x, typ = typeof x) => E.message(`${E.string(x)} ~ ${typ}`)

  // set ================================================================================

  /** Set a given editor configuration.
   *
   * Using this function alters your `settings.json`.
   * In essence, this function makes `init.js` a dynamic JS programmatic replacement
   * over the static JSON configuration `settings.json`.
   *
   * ### Example Uses
   * ```
   * E.set("editor.fontSize", 14) // I'd like a large font... I should wear my glasses more often.
   *
   * E.set("workbench.colorTheme", "Solarized Light") // Use a neato theme
   * // Note: Cmd+K Cmd+T to see all themes and try them out on-the-fly.
   *
   * E.set("semantic-highlighting.isEnable", true) // colors-as-types!
   *
   * // Add a motavational motto to the VSCode frame window title
   * E.set("window.title", "${activeEditorLong} Living The Dream (•̀ᴗ•́)و")
   *
   *  // Make "=>, !=, ===, <=, >=, <>, etc" look like single-symbol Unicode!
   * E.set("editor.fontLigatures", true)
   * ```
   *
   * ### Useful Reading
   * https://www.roboleary.net/2021/11/06/vscode-you-dont-need-that-extension2.html
   */
  E.set = (key, value) => {
    let settings = JSON.parse(require('fs').readFileSync(E.internal.set.path))
    settings[key] = value
    require('fs').writeFileSync(E.internal.set.path, JSON.stringify(settings, null, 2))
    return { key, value }
  }

  /** The converse of `E.set`. This gets values from the user's `settings.json` file.
   *
   * ### Example Usage
   * ```
   * // If you want the entire (current workspace) config, invoke without any args:
   * const usersEntireConfig = E.get()
   * ```
   */
  E.get = vscode.workspace.getConfiguration

  /** The path used by `E.set` to find the user's `settings.json` file. */
  E.internal.set = { path: `${process.env.HOME}/Library/Application\ Support/Code/User/settings.json` }

  // bindKey ================================================================================

  /** Bind `key` sequence to the given `command` name (only `when` predicate is true).
   *
   * An excellent introduction to customising VSCode keybindings and why you would even
   * want to add new keybindings can be found at:
   * https://www.roboleary.net/2022/02/28/vscode-keyboard-fu-custom-keyboard-shortcuts.html
   * - See also this Keybindings Cheat Sheet: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
   *
   * ### Example Use
   * ```
   * // Press Cmd+m to select current word, then again to select current expression, then again for current line/scope.
   * // Using "r" for ever-expanding-"R"egion
   * E.bindKey("cmd+r", "editor.action.smartSelect.expand")
   * ```
   *
   * ### How to find out what command is bound to a specific key?
   *
   *   `Cmd+Shift+P  Default Keyboard Shortcuts Cmd+P @`Now-enter-your-key-sequence
   *
   * ### How to remove a key binding from an action? E.g. Remove `Cmd+Shift+K` from `Delete Lines`.
   *   ```
   *    E.bindKey("cmd+shift+k", undefined)
   *    ```
   */
  E.bindKey = (key, command, when = 'editorTextFocus') => {
    // ? Note: We likely want to parse using `hjson` instead!
    // Remove starting comment
    let keys = require('fs')
      .readFileSync(E.internal.bindKey.path)
      .toString()
      .replace('// Place your key bindings in this file to override the defaults', '')
    keys = JSON.parse(keys)
    // Override any existing binding for the given key.
    keys = keys.filter(binding => binding.key !== key)
    keys.push({ key, command, when })
    require('fs').writeFileSync(E.internal.bindKey.path, JSON.stringify(keys, null, 2))
    return { key, command, when }
  }

  /** The path used by `E.set` to find the user's `settings.json` file. */
  E.internal.bindKey = { path: `${process.env.HOME}/Library/Application\ Support/Code/User/keybindings.json` }

  // String, Message, Error ================================================================================

  /** Ensure input `x` is a string; if it's not, then stringify it.
   *
   * ### Examples
   * ```
   * var eg = {x: 1, y: 4, 'name is long': () => console.log("musa")}
   * JSON.stringify(eg) // omits the function, and adds lots of quotes.
   * E.string(eg) // Shows the function and not any quotes
   *
   * var f = () => 1
   * console.log(f) // => '[Function: f]' ---this is in a NodeJS repl
   * E.string(f) // => '() => 1'; ie the definition of `f`
   * ```
   */
  E.string = x => {
    if (typeof x === 'string') return x
    if (typeof x === 'function') return x.toString()
    if (Array.isArray(x)) return JSON.stringify(x)
    if (typeof x === 'object')
      return `{${Object.keys(x)
        .map(k => k + ': ' + x[k])
        .join('; ')}}`
    return `${x}`
  }

  /** Show JavaScript item `obj` in a VSCode information notification; `obj` is ensured to be a `E.string`.
   *
   * Optionally, `buttons` is an array of strings that are used as buttons; the result of the `E.message` is a thennable
   * that refers to the user's button click, if any.
   *
   * For a smooth transition to `Easy-Extensibility`, the `Cmd+E` keybinding
   * makes `console.log(...args)` output a string via `E.message`.
   * Likewise, `console.error` and `console.warn` are output via `E.error` and
   * `E.warning`.
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
  E.message = (obj, ...buttons) => vscode.window.showInformationMessage(E.string(obj), ...buttons)

  /** Show JavaScript item `obj` in a VSCode warning notification; `obj` is ensured to be a `E.string`.
   *  - See the documentation for `E.message` regarding similar example uses.
   */
  E.warning = (obj, ...buttons) => vscode.window.showWarningMessage(E.string(obj), ...buttons)

  /** Show JavaScript item `obj` in a VSCode error notification; `obj` is ensured to be a `E.string`.
   *  - See the documentation for `E.message` regarding similar example uses.
   */
  E.error = (obj, ...buttons) => vscode.window.showErrorMessage(E.string(obj), ...buttons)

  // Overlays ================================================================================
  E.overlayType = vscode.window.createTextEditorDecorationType({
    after: {
      margin: '0 0 0 0.5rem'
    },
    dark: { after: { border: '0.5px solid #808080' } },
    light: { after: { border: '0.5px solid #c5c5c5' } }
  })

  // Hide overlays on keyboard movement; otherwise the overlay moves too
  vscode.window.onDidChangeTextEditorSelection(event => {
    let { Command, Keyboard } = vscode.TextEditorSelectionChangeKind
    if ([Command, Keyboard].includes(event.kind)) E.withEditor(ed => ed.setDecorations(E.overlayType, []))
  })

  /** Show JavaScript item `obj` in an overlay at the end of the line; `obj` is ensured to be a `E.string`.
   * Return the resulting overlay decoration config.
   *
   * ### Example Use
   * ```
   * E.internal.echoFunction = obj => E.overlay(`⮕ ${obj}`)
   * 4 + 5 // Cmd+E shows the result HERE, on this line, in an overlay; not far below in the right-most corner.
   * ```
   *
   * Other useful arrows: ⬅ ⮕ ⬆ ⬇
   *
   * ### Overlays are one-per-line: Only the final `E.overlay` call yields an observable effect.
   * ```
   * E.overlay("Hello"); E.overlay("World!")
   * ```
   * Is essentially the same as just:
   * ```
   * E.overlay("World!")
   * ```
   */
  E.overlay = obj => {
    const editor = vscode.window.activeTextEditor
    if (!editor) return
    const decoration = {
      range: editor.selection,
      renderOptions: { after: { contentText: E.string(obj) } }
    }
    editor.setDecorations(E.overlayType, [decoration])
    return decoration // : DecorationOptions
  }

  // Decorations ================================================================================

  /** Escapes a given string for use in a regular expression */
  E.rxEscape = literal => literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Implementation note: We replace any regexp operations with a \\ in-front of them.
  // $& means the whole matched string.

  /** Collection of style types defined by `E.decorateRegexp`.
   *
   * Internal meta-data required to make E.decorateRegexp work; i.e., to make determinstic.
   */
  E.internal.decorateRegexp = { styles: {} }

  /** Apply `style` to every instance of `regexp` in the currently active editor.
   *
   * ### Useful Resources
   * - https://eloquentjavascript.net/09_regexp.html#:~:text=A%20number%20of%20common%20character%20groups
   * - The VSCode `Text Regexp` extension, to try out your regexps as you write them!
   * - The function `E.rxEscape` for forming regexps from string literals.
   *
   * ### Arguments
   * - `rx: RegExp | string`
   * - `disable: boolean`
   * - `style: object` with possible keys being a small set of CSS properties ---but in JS `camelCase` rather than in CSS `kebab-case`.
   *    - CSS styling properties that will be applied to text enclosed by a decoration:
   *      - `backgroundColor?: string` Background color of the decoration.
   *      - `outline?: string` ---for more fine-grained control, there are also the CSS properties
   *         - `outlineColor?, outlineStyle?, outlineWidth?: string`
   *      - `border?: string` ---for more fine-grained control, there are also the CSS properties
   *         - `borderColor?, borderRadius?, borderSpacing?, borderStyle?, borderWidth?: string`
   *      - Sadly there is no supported `fontFamily` option.
   *      - `textDecoration?: string` The text-decoration shorthand CSS property sets the appearance of decorative lines on text.
   *          (It is a shorthand for CSS text-decoration-line, text-decoration-color, text-decoration-style, and the newer text-decoration-thickness property.)
   *          - Line values `underline, overline, linethrough` and any combinations thereof.
   *          - Style values `solid, double, dotted, dashed, wavy`
   *          - Color property sets the color of decorations added to text by text-decoration-line.
   *          - Thickness property sets the stroke thickness of the decoration line that is used on text in an element, such as a line-through, underline, or overline.
   *      - `cursor?: string`: How should the cursor look? Values are documented at https://www.w3schools.com/cssref/pr_class_cursor.asp
   *      - `color?: string`
   *      - `letterSpacing?: string` Increases or decreases the space between characters in a text. E.g., `"10px"`.
   *      - `gutterIconPath?: string | Uri` An **absolute path** or an URI to an image to be rendered in the gutter.
   *      - `gutterIconSize?: string` Specifies the size of the gutter icon.
   *         Available values are 'auto', 'contain', 'cover' and any percentage value.
   *         For further information: https://msdn.microsoft.com/en-us/library/jj127316(v=vs.85).aspx
   *      - `overviewRulerColor?: string | ThemeColor` The color of the decoration in the overview ruler. Use rgba() and define transparent colors to play well with other decorations.
   *
   *      - `before?: ThemableDecorationAttachmentRenderOptions` Defines the rendering options of the attachment that is inserted before the decorated text.
   *      - `after?: ThemableDecorationAttachmentRenderOptions` Defines the rendering options of the attachment that is inserted after the decorated text.
   *         E.g., `{ after: { border: '0.5px solid #808080' } }`
   *         - See also the definition of `E.overlay`.
   *
   * ### Examples
   * Note: We use a Unicode star, "✶/", in the examples below since an ASCII star, Shift+8, terminates JSDocs.
   * ```
   * // Colour all words "hello" in pink; including: hello HeLlO
   * E.decorateRegexp(/hello/i, { backgroundColor: "pink" })
   *
   * // Disable such decorations
   * E.decorateRegexp(/hello/i, { backgroundColor: "pink" }, {disable: true})
   *
   * // Use a string literal, without worrying about escaping regular expression operators.
   * E.decorateRegexp(`\\ Did you know 1 + 1 = 2?`,  { backgroundColor: "pink", color: "cyan" })
   *
   * // Decorate all words that start with 'B' and end with 'E'; ignoring case
   * E.decorateRegexp(/B\w*E/i, { backgroundColor: "pink" })
   *
   * // All lines mentioning "G" are coloured green, from the "G" to the end of the line.
   * E.decorateRegexp(/G.✶/, { color: "#98C379" })
   * // Colour all lines that start with "G" green, and those with "B" to be blue!
   * E.decorateRegexp(/\nG.✶/, { color: "#98C379" });
   * E.decorateRegexp(/\nB.✶/, { color: "blue" });
   *
   * // [Better Comments!] Colour all lines that start with "// M" maroon, until end of line.
   * E.decorateRegexp(new RegExp(`\n${E.rxEscape('//')} ✶M.✶`), {color: "maroon"})
   * // Example usage is below:
   * //   M    hi there amigo !
   *
   * // Add a blue frame around all occurrences of the word "console.log"
   * // I use this as a visual aid when doing print-debugging so as to remember to remove these prints when I'm done.
   * E.decorateRegexp("console.log", {outline: "thick double #32a1ce"})
   *
   * // Increase spacing of all "Neato" in the current editor, and encircle it in a purple curved box.
   * E.decorateRegexp("Neato", {outline: "2px ridge rgba(170, 50, 220, .6)", borderRadius: "1rem", letterSpacing: "2px"})
   *
   * // A more involved example: Show "Hiya" as if it were a pink button, with a border, underlined in blue cyan, and being green bold
   * E.decorateRegexp("Hiya", {border: "solid", borderRadius: "3px", borderWidth: "1px", letterSpacing: "1px", textDecoration: "underline cyan 2px", color: "green", fontWeight: "bold", backgroundColor: "pink" }, {disable: true})
   *
   * // Phrases starting with "#:" are emphasised with large wavy lines, to indicate "Look Here!"
   * E.decorateRegexp(/#:.✶/, {fontStyle: "cursive", textDecoration: "underline overline wavy blue 3px"})
   *
   * // Make "# Experimenting #" look like a solid pink button, with thick green text and a blue underline.
   * // I like to use this to explicitly demarcate what chunk of code is stuff I'm experimenting with and may end-up deleting.
   * // I like the "#"-syntax since it's reminiscent of Markdown section markers.
   * E.decorateRegexp(/#.* #/, {border: "solid", borderRadius: "3px", borderWidth: "1px", letterSpacing: "1px", textDecoration: "underline cyan 2px", color: "green", fontWeight: "bold", backgroundColor: "pink" })
   * ```
   *
   * ### See also
   * `E.rxEscape` This escapes regular expression operators in strings.
   */
  E.decorateRegexp = (rx, style = { backgroundColor: 'green' }, options = { disable: false }) => {
    let ed = vscode.window.activeTextEditor
    // Ensure input is a regexp with 'g'lobal flag present.
    if (typeof rx === 'string') rx = new RegExp(E.rxEscape(rx))
    let regexFlags = [...new Set(('g' + rx.flags).split(''))].join('')
    rx = new RegExp(rx, regexFlags)

    // Ensure this function is determinstic, with respect to its explicit output value.
    let key = JSON.stringify(style)
    let css = E.internal.decorateRegexp.styles[key] || vscode.window.createTextEditorDecorationType(style)
    E.internal.decorateRegexp.styles[key] = css

    // Actually decorate the given regexp according to the given style, then add some hooks.
    doDecorate()
    vscode.window.onDidChangeActiveTextEditor(doDecorate)
    vscode.workspace.onDidChangeTextDocument(event => doDecorate(vscode.window.activeTextEditor))

    return css

    function doDecorate(editor = ed) {
      editor.setDecorations(css, []) //* Remove existing decorations
      if (options.disable) return
      let text = editor.document.getText()
      let match
      let ranges = []
      while ((match = rx.exec(text))) {
        let startPos = editor.document.positionAt(match.index)
        let endPos = editor.document.positionAt(match.index + match[0].length)
        ranges.push({ range: new vscode.Range(startPos, endPos) })
      }
      editor.setDecorations(css, ranges)
    }
  }

  // Navigation ================================================================================

  /** Move cursor forward to the next character, or `n`-many characters.
   * - `n` is a number.
   * - Move backward when `n` is negative.
   *
   * Movement is limited to the current line: If `n` is too large, we just move to the 0th column of the next line.
   */
  E.nextChar = (n = 1) => E.executeCommand('cursorMove', { to: 'right', value: n })

  /** Move cursor forward to the next line, or `n`-many lines.
   * - `n` is a number.
   * - Move backward when `n` is negative.
   */
  E.nextLine = (n = 1) => E.executeCommand('cursorMove', { to: 'down', by: 'wrappedLine', value: n })

  /** Move cursor to the end of the current line. */
  E.endOfLine = () => E.executeCommand('cursorLineEnd')

  /** Move cursor to the start of the current line. */
  E.startOfLine = () => E.executeCommand('cursorLineStart')

  /** Move cursor to the last line of the editor. */
  E.endOfEditor = () => E.nextLine(E.lastLineNumber())

  /** Move cursor to the first line of the editor. */
  E.startOfEditor = () => E.nextLine(-E.lastLineNumber())

  /** Move cursor to the given `line` number and `column` number. */
  E.gotoLine = (line, column) => {
    E.startOfEditor()
    E.nextLine(line - 1)
    E.startOfLine()
    if (column) E.nextChar(column)
  }

  /** Save cursor location, execute `callback`, then return to the orginal cursor location.
   *
   * This is useful for methods that move the cursor to do some work, like grabbing text from some random line,
   * but we don't want to confuse the user with unexpected cursor movements, so we restore them when the underlying task is done.
   *
   * ### Example
   * ```
   * // Echo the contents of the first line, but leave cursor at its current position.
   * E.saveExcursion(_ => {E.startOfEditor(); E.copy().then(E.message) })
   * ```
   *
   * TODO: We might move the cursor to a different editor, so ideally we save the current editor as well and restore it.
   */
  E.saveExcursion = callback => {
    let editor = vscode.window.activeTextEditor
    let position = editor.selection.active
    callback()
    editor.selection = new vscode.Selection(position, position)
  }

  // Inserts & input ================================================================================

  /**  Insert text at current cursor position;  `it` is ensured to be a `E.string`. */
  E.insert = obj => {
    const editor = vscode.window.activeTextEditor
    if (editor) editor.edit(editBuilder => editBuilder.insert(editor.selection.active, E.string(obj)))
  }

  /** Insert a new line and move cursor to start of it. */
  E.newLine = () => {
    E.executeCommand('lineBreakInsert')
    E.nextLine()
  }

  /** Insert string `str` at the given `line` number and `col`umn number.
   * - If the line ends before the specified `col`, then insert the text at the final column (ie end of line).
   */
  E.insertAt = (line, col, str) =>
    vscode.window.activeTextEditor.edit(editBuilder => editBuilder.insert(new vscode.Position(line - 1, col), str))

  /** Save all editors. */
  E.saveAll = () => E.executeCommand('workbench.action.files.saveAll')

  /** Perform a super simple textual find-replace on the current editor.
   * #### Example use
   * ```
   * E.findReplace("Hi buddo!", "Hola") // This will alter this exact file, and replace the first phrase with the second!
   * ```
   */
  E.findReplace = (oldy, newy, file = E.currentFileName()) =>
    Promise.resolve(E.saveAll()).then(_ => E.shell(`sed -i '' 's/${oldy}/${newy}/g' ${file}`))

  /** Read a string, possibly with completion.
   *
   * - `prompt?: string` An optional string to show as placeholder in the input box to guide the user what to type.
   * - `choices?: undefined | string[] | object` The collection of completion candidates, if any.
   *
   * The result depends on whether `choices` is provided or not, and it's type:
   * 1. If `choices` is not provided, then the result is the string the user entered.
   * 2. If `choices` is an array of strings, then the result is one of those array elements. (As entered by the user.)
   * 3. If `choices` is an object, then the completions are the keys (from which the user can enter) and the result is the associated value.
   *
   * #### Examples
   * ```
   * // Get an input and try to convert it to a number, then show its double in a message
   * E.readInput().then(Number).then(x => E.message(2 * x))
   *
   * // Alternatively, using E's await:
   * {
   *   let it = await E.readInput("Favorite number?")
   *   let double = Number(it) * 2
   *   E.message(double)
   * }
   *
   * // Let user select from options `parent` and `son`, but whose values are `Musa` and `Yusuf`, respectively.
   * E.completingRead('Who?', { parent: 'Musa', son: 'Yusuf' }).then(E.message)
   * ```
   * #### Example Application: Open favourite video in browser
   * ```
   * // Completing read, for videos I like to have in the background
   * E.readInput('What do you want to listen to?',
   *  {
   *   'Uncle Iroh': 'https://youtu.be/jhvUqV3qeC0',
   *   'Oh Hussain!': 'https://youtu.be/6EHroVqxWDo',
   *   'ASMR ~ Walking Vancouver': 'https://youtu.be/hL2NYxKGTts'
   * }).then(E.browseURL)
   * ```
   * */
  E.readInput = (prompt, choices) => {
    if (!choices) return vscode.window.showInputBox({ placeHolder: prompt })
    if (Array.isArray(choices)) return vscode.window.showQuickPick(choices, { placeHolder: prompt })
    return vscode.window.showQuickPick(Object.keys(choices), { placeHolder: prompt }).then(key => choices[key])
  }

  // Selections ================================================================================

  /** Get the current line number as, well, a number. */
  E.currentLineNumber = () => vscode.window.activeTextEditor.selection.active.line + 1
  // Implementation note: Internally, vscode uses zero-indexing and so the number the user sees is one-off from the internal
  // number, so we adjust that with a +1. Note: null + 1  ==  1

  /** Get the number of the final line of the current active edtior. */
  E.lastLineNumber = () => vscode.window.activeTextEditor.document.lineCount

  /** Get the contents of line `n` as a string. */
  E.lineAt = n => vscode.window.activeTextEditor.document.lineAt(Math.max(0, n - 1)).text
  // Implementation note: Internally, vscode uses zero-indexing and so the number the user sees is one-off from the internal
  // number, so we adjust that with a -1.

  /** Get the string contents of the first line. */
  E.firstLine = () => E.lineAt(0)

  /** Get the string contents of the last line. */
  E.lastLine = () => E.lineAt(E.lastLineNumber())

  /** Get the current line's contents as a string. */
  E.currentLine = () => E.lineAt(E.currentLineNumber())

  /** Get the entire contents of the current editor, as a string. */
  E.editorContents = () => vscode.window.activeTextEditor.document.getText()

  /** Erase all contents of an editor, and replace its contents with the given string `replacement`, if any. */
  E.clearEditor = (replacement = '') =>
    vscode.window.activeTextEditor.edit(editBuilder =>
      editBuilder.replace(
        new vscode.Range(new vscode.Position(0, 0), new vscode.Position(E.lastLineNumber(), 0)),
        replacement
      )
    )

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

  /** Select text from current cursor position until the end of the current line.
   * - This method starts a selection of a region, it does not return any text by itself.
   * - See also `E.copyLine`.
   */
  E.endOfLineSelect = () => E.executeCommand('cursorLineEndSelect')

  /** Select text from current cursor position until the start of the current line.
   * - This method starts a selection of a region, it does not return any text by itself.
   * - See also `E.copyLine`.
   */
  E.startOfLineSelect = () => E.executeCommand('cursorLineStartSelect')

  // Clipboard ================================================================================

  /** Get the clipboard contents, as a promised string.
   * #### Examples
   * ```
   * // What's in the clipboard?
   * E.clipboardRead().then(E.message)
   *
   * // Insert the contents of the clipboard; [First approach]
   * E.paste()
   *
   * // Insert the contents of the clipboard; [Second approach]
   * E.clipboardRead().then(E.insert)
   * ```
   * ### See Also
   * `E.copy`, `E.cut`, `E.paste`, `E.clipboardRead`, `E.clipboardWrite`, `E.copyLine`.
   */
  E.clipboardRead = vscode.env.clipboard.readText

  /** Write the given string to the clipboard.
   * #### Examples
   * ```
   * // Save something to the clipboard.
   * E.clipboardWrite("Hiya")
   *
   * // Check that the clipboard currently holds what we believe it does.
   * E.clipboardRead().then(x => E.message(x === "Hiya"))
   *
   * // Insert the contents of the clipboard; [First approach]
   * E.paste()
   *
   * // Insert the contents of the clipboard; [Second approach]
   * E.clipboardRead().then(E.insert)
   * ```
   * ### See Also
   * `E.copy`, `E.cut`, `E.paste`, `E.clipboardRead`, `E.clipboardWrite`, `E.copyLine`.
   */
  E.clipboardWrite = vscode.env.clipboard.writeText

  /** Copy current line, or any active selection. Returns a promise.
   * #### Examples
   * ```
   * // Copy current line, then make use of the string that has been copied.
   * E.copy().then(x => E.message(x))
   *
   * // Or using E's await:
   * {
   * 	let x = await E.copy()
   * 	let y = x.toUpperCase()
   * 	E.message(y)
   * }
   *
   * // Copy the current line, then immediately paste it back, twice
   * E.copy(); E.paste(); E.paste()
   * ```
   * ### See Also
   * `E.cut`, `E.paste`, `E.clipboardRead`, `E.clipboardWrite`, `E.copyLine`.
   */
  E.copy = () => Promise.resolve(E.executeCommand('execCopy')).then(E.clipboardRead)

  /** Cut current line, or any active selection. Returns a promise.
   * #### Examples
   * ```
   * // Cut current line, then make use of the string that has been cut.
   * E.cut().then(x => E.message(x))
   * ```
   * ### See Also
   * `E.copy`, `E.paste`, `E.clipboardRead`, `E.clipboardWrite`, `E.copyLine`.
   */
  E.cut = () => Promise.resolve(E.executeCommand('execCut')).then(E.clipboardRead)

  /** Paste current clipboard contents, overwriting any active selection. Returns a promise.
   * #### Examples
   * ```
   * // Paste clipboard contents, then make use of the string that has been pasted.
   * E.paste().then(E.message)
   * ```
   * ### See Also
   * `E.copy`, `E.cut`, `E.clipboardRead`, `E.clipboardWrite`, `E.copyLine`.
   */
  E.paste = () => Promise.resolve(E.executeCommand('execPaste')).then(E.clipboardRead)

  /** Copy the contents of the current line, or a given numeric `line` number. */
  E.copyLine = (line = E.currentLineNumber()) =>
    E.saveExcursion(_ => {
      E.gotoLine(line)
      E.endOfLineSelect()
      E.copy()
      E.paste()
    })

  // currentFileName, shell, browseURL ================================================================================

  /** Get the name of the current file, editor, as a string.
   *
   * Returns the path to the (file displayed by the) currently active editor (window pane).
   *
   * For example, within my `~/init.js` pressing `cmd+e` on the following:
   * ```
   * E.currentFileName() //  ⇒  /Users/musa/init.js
   * ```
   */
  E.currentFileName = () => vscode.window.activeTextEditor.document.fileName

  /** Get the name of the directory that contains the current file, editor, as a string.
   *
   * For example, within my `~/init.js` pressing `cmd+e` on the following:
   * ```
   * E.currentDirectory() //  ⇒  /Users/musa/
   * ```
   */
  E.currentDirectory = () => E.currentFileName().split('/').slice(0, -1).join('/')

  /** Run a shell command and provide its result as a string; or crash when there's an error.
   * This is intentionally synchronous; i.e., everything stops until the command is done executing.
   *
   * @param {string} command - A Unix bash incantation to be executed.
   * @param {boolean} ignore - Whether to actually avoid doing any execution; useful for testing/experimentation.
   * @returns {string} The textual stdout result of executing the given command.
   *
   * - We may want to switch to ShellJS after this script stablises.
   * - Why ShellJS? https://julialang.org/blog/2012/03/shelling-out-sucks/
   * - See also `Executing shell commands from Node.js`, https://2ality.com/2022/07/nodejs-child-process.html
   *
   * ### Examples
   * ```
   * // Who is the current user?
   * console.log( E.shell('whoami') )
   *
   * // Make me smile!
   * console.log( E.shell('fortune') )
   *
   * // See your Git credentials: Name, email, editor, etc.
   * E.shell("git config --list")
   *
   * // Crashes if the provided command does not exist
   * E.shell(`nonexistentprogram`); console.log(`You wont see this msg!`) // Boom!
   *
   * // Pass non-fasly second argument to invoke as a dry-run only
   * E.shell(`nonexistentprogram`, true); console.log(`You WILL see this msg!`)
   * ```
   *
   * ### See Also
   * `E.asyncShell` runs shell commands asynchronously.
   */
  E.shell = (command, ignore) => {
    if (!ignore) return require('child_process').execSync(command).toString()?.trim()

    console.log(`\n🤖 🧪 This is a DRY RUN, so I haven't done anything but I would have:`)
    console.log(`\t🧪 ${command}`)
  }

  /** Run a shell command asynchronously and get the result as promised object of `{stdout: string, stderr: string}`.
   *
   * ### Examples
   * ```
   * // Make me smile! (Using E's await).
   * E.message((await E.asyncShell('fortune')).stdout)
   *
   * // Run an arbitrary command-line function on the current file; namely prettier.
   * E.asyncShell(`prettier --write ${E.currentFileName()}`)
   * ```
   *
   * ### See Also
   * `E.shell` runs shell commands synchronously.
   */
  E.asyncShell = require('util').promisify(require('child_process').exec)

  /** Create a new terminal, within VSCode, that runs the given string command `cmd`.
   *  Title the resulting terminal with the given `title` string.
   *
   *  Result value is of type `vscode.Terminal`.
   *
   * ### Example Usage: Extension Idea: Run arbitrary CLI commands on the current file & see the result
   * ```
   * commands["Run gulp tests"] = E => E.terminal(`npx gulp test-partial --file=${E.currentFileName()}`, "Gulp!")
   * ```
   * - Now `cmd+h gulp` will actually run your Gulp tests *only* on the current file.
   * - Note: There is an awesome *Tasks Explorer* VSCode extension which will show available commands to run, such as gulp;
   *   but it does not provide the fine-grained capability of this particular example ---namely, to be run on the current file only.
   *
   * #### Even better would be to change the behaviour of this command, on the fly
   * With the code below, `cmd+h gulp` will run Gulp on the current file,
   * whereas `shift+cmd+h` will run the Gulp precommit task for the entire repo.
   * ```
   * commands["Run gulp tests"] = E => {
   *   const cmd = E.currentPrefixArgument ? 'gulp precommit' : `npx gulp test-partial --file=${E.currentFileName()}`
   *   E.terminal(cmd, 'Gulp!')
   *  }
   * ```
   */
  E.terminal = (cmd, title = cmd) => {
    let t = vscode.window.createTerminal(title)
    t.sendText(cmd)
    t.show(true) // Ensure terminal is showing, but don't force focus to jump here!
    return t
  }

  /** Make a new webpanel with the given `title` string, that renders the given `html` string.
   *
   * ### Example Use
   * ```
   * E.webPanel('Fortune!', `<marquee>${ E.shell("fortune") }</marquee>`)
   * ```
   *
   * See docs: https://code.visualstudio.com/api/extension-guides/webview
   *
   * ### Alternatives
   *
   * If you only need a container for readonly textual information, consider using `output channel`.
   *
   * E.g., the following creates add a new menu item to the `Output` tab in the bottom-most panel
   * within VSCode. Then we show that channel of output, and add some text to it.
   *
   * ```
   * // An output channel is a container for readonly textual information.
   * let c = vscode.window.createOutputChannel('Why, Hello There!')
   * c.show()
   * c.append("Hiya")
   * ```
   *
   * Essentially this gives a "logging mechanism" to users.
   */
  E.webPanel = (title, html) => {
    vscode.window.createWebviewPanel(null, title).webview.html = html
  }

  /** Browse to a given `url` string, using the OS default browser.
   * #### Example Usage
   * ```
   * E.browseURL("www.icanhazdadjoke.com")
   * ```
   */
  E.browseURL = url => E.shell(`open ${url.startsWith('http') ? '' : 'http://'}${url}`)

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

  /** Opens a given file `path` string in the current VSCode instance. Returns a thennable.
   * If the `path` does not point to a file, we invoke callback `otherwise`; which defaults to making a new empty file.
   *
   * #### Examples
   * ```
   * // Using an absolute path
   * E.findFile('Users/musa/init.js')
   *
   * // Using a relative path
   * E.findFile('~/init.js')
   * ```
   *
   * ### Implementation Notes
   * Note that there is `vscode.workspace.findFiles` which finds all files matching a given pattern
   * *only* within the current workspace.
   */
  E.findFile = (path, otherwise = _ => E.shell(`touch ${path}`)) =>
    vscode.window.showTextDocument(vscode.Uri.file(path.replace(/~/g, process.env.HOME))).catch(otherwise)

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

  // ================================================================================

  E.require = (pkg, explicitPath = 'index.js') => {
    let attempt = path => {
      try {
        return require(`${E.internal.require.NODE_PATH}/${pkg}/${path}`)
      } catch (e) {
        return
      }
    }
    return attempt(explicitPath) || attempt('src/index') || attempt('lib/index') || attempt(`bundle/${pkg}`)
  }

  // ================================================================================

  E.internal.log = vscode.window.createOutputChannel('easy-extensibility')

  E.internal.executeRegisteredCommand = commands => async currentPrefixArgument => {
    E.currentPrefixArgument = currentPrefixArgument
    let options = { placeHolder: 'Pick a command ' }
    try {
      const result = await vscode.window.showQuickPick(Object.keys(commands), options)
      if (result) {
        E.message(`Executing “${result}”...`)
        commands[result](E, vscode)
      }
    } finally {
      E.currentPrefixArgument = undefined
    }
  }

  /** How is a selected piece of text to be evaluated with `cmd+e`?
   *
   * ### Output Channel
   *
   * For convenience, such as top-level `await`'s, easy-extensibility performs some rewrites on your code before actually
   * evaluating.
   *
   * To see the exact expression that easy-extensibility "sees" when it evaluates your code with CMD+E, open
   * the `Output` pane in the bottom part of VSCode, then select `easy-extensibility` from the dropdown menu in the
   * right-most side of the pane.
   *
   * This output channel shows you what Easy-Extensibility is evaluating when you press CMD+E;
   * it also provides hints/comments on when things don't go as you expect!
   *
   * (E.g., why your local `let`'s cannot be used globally; or why a side-effectful statement does not show any value notification.)
   *
   * ### Example
   * `CMD+E` is `*`-aware; i.e., you can press `CMD+E` on the lines below and leading *'s are ignored.
   * ```
   * // For accessibility, the familiar `console.log/warn/error` are elaborated into VSCode GUI notifications.
   * console.log("Hello, world!") // => See a nice pop-up appear in the bottom-right porition of the screen
   *
   * // Just as `console` is a special object, you now have three new exposed ones:
   * console.log(E, vscode, commands)
   *
   * // [Inserting Evaluation] Press SHIFT CMD+E to have an expression's value inserted.
   * Object.keys(commands).join('\n')  // => Shows all commands registered in the user's pallete (CMD+H)
   *
   * // Objects are echoed in the bottom-left corner nicely, similar to the approach of browsers.
   * var example = {age: 10 + 2, speak: phrase => `Hello, ${phrase}!` } // CMD+E echoes this nicely
   *
   * // The value of the last expression is emitted when CMD+E is invoked.
   * let obj = {x: 1, y : 2}; let {x, y} = obj; x + y // => 3
   *
   * // [Let is Local] A `let` only exists for a single `CMD+E` press; subsequent `CMD+E` presses will not know about your `let`.
   * let a = 19                    // 1. Press CMD+E on this line; (notice a helpeful warning in the Output Channel.)
   * let { x } = { x: 23, a }; x  //  2. Press CMD+E on this line; see the error pop-up that `a` is undefined.
   * // If you select both lines above, then press CMD+E then you'll see the value of `x` ---since `aa` is defined in this single CMD+E press.
   *
   * // [Var is Global] A `var` exists throughtout all `CMD+E` presses.
   * var a = 19                    // 1. Press CMD+E on this line
   * let { x } = { x: () => "hi", a }; x  //  2. Press CMD+E on this line; see the value of `x`
   *
   * // [Locals shadow globals] Press CMD+E on each line; the 3rd line does not alter the global `x` of the 1st line.
   * // Instead, line 3 creates a local variable named `x`, then does not use it.
   * var x = 0
   * console.assert(x === 0)
   * let x = 1               // (Notice a helpeful warning in the Output Channel.)
   * console.assert(x === 0)
   *
   * // [Locals shadow globals; function example]
   * var x = 'global'; function f() { let x = 'local' }; f(); console.assert(x === 'global')
   *
   * // [Top-Level Awaits] CMD+E allows liberal use of `await` clauses as a syntactic sugar for async IIFEs.
   *  var { a, b } = await { a: 1, b: 2, c: 3}
   *  console.assert( a === 1 && b === 2)
   *
   * (Note: Technicallly `var`s in any function are LOCAL to that function; so even though the implementation wraps await 's up in
   * an async IIFE, we also discard all `var` qualifiers so that you get globals just as when you do without awaits; e.g., `var x = 1`.
   * For the curious, you can actually see this rewrite by openinig the `Output` pane in the bottom part of VSCode.)
   *
   * // Of-course, you can still write async IIFE manually and things will work as expected. CMD+E each line:
   * var a
   * (async () => { a = await 233 })()
   * console.assert(a === 233)
   *
   * // [Errors are reported nicely]
   * var h = async () => { return { x: NOPE + 1 } }
   * await h() // Should see a useful error message!
   *
   * // As usual with NodeJS, `var`s in functions remain local to that scope.
   * function f() { var vv = 1 }
   * f()
   * vv // => Error: vv is not defined
   *
   * // Example of declaraing an interactive function; more on this below.
   * function f(E) { E.warning("hiya") }
   * // Usage-1: Use it in code
   * f(E)
   * // Usage-2: Cmd+h f RETURN :-)
   * ```
   *
   * ### When is a given function to be added to the user's custom pallete, cmd+h?
   * When it has `E` as an argument!
   *
   * Functions that depend on `E` are "interactive functions"
   * and so are part of the user's command pallette, cmd+h; otherwise
   * they are useful utility functions that the user wishes to have
   * loaded into the current VSCode session ---but are not intended to be interactively invoked.
   *
   * ```
   * function hi(x) { return x * 2 }
   * hi(4) // => 8
   *
   * function hello(E) { E.message("Hello") }
   * ```
   * Cmd+H will now show "hello"
   *
   * Note, interactive commands must be functions declared with `function`
   * or attached explicitly to the `commands` object.
   * ```
   * const nope = E => E.message("hi") // This will not be added to the pallete.
   * ```
   * This is intended as a hybrid of functions that do work on E, but do
   * are not intentionally meant to be interactive.
   *
   * ### Implementation Notes
   *
   * If we use `eval("x = 1")` then `x` becomes a global variable;
   * whereas `eval("var x = 1")` creates a locally scoped variable.
   *
   * So we can easily remove all `let, const, var` so all declarations look like `leftSide = rightSide`
   * and so we only have global variables; but this is terrible, since scope is a useful concept: Otherwise,
   * you need to ensure all variables everywhere have unique names, unless you intentional want to clobber
   * existing globals, (regardless you will create new globals)!
   *
   * A better approach is to use `(1, eval)`. Indirect evaluation creates globally scoped variables for `var l = r`
   * and locally scoped variables for `let l = r`. This is a better middle ground.
   *
   * Using indirect-eval to evaluate strings as code IN A GLOBAL CONTEXT.
   * ```
   * (1, eval)(`var apple = 5; function igo() { return 12 }; let nope = 3; `) // LET & const are local!
   * apple // => 5
   * igo() // => 12
   * nope  // => Error: nope is undefined
   * ```
   *
   * For more on indirect eval, read:
   * - https://2ality.com/2014/01/eval.html
   * - https://2ality.com/2012/07/evaluator-via-eval.html
   */
  E.internal.evaluateSelection = commands => currentPrefixArgument => {
    // To evaluate the current selection, we need an active editor.
    // For the exact dependency, see the implementation of `E.selection`.
    let editor = vscode.window.activeTextEditor
    if (!editor) return

    let text = E.selectionOrEntireLine()

    // I'd like to be able to select a JS doc example usage and quickly run that;
    // as such, we ignore all leading '*' on new lines.
    text = text.replace(/(\n|^)\s*\*/g, '$1')

    // TODO: Find-replace, simplest thing?!  Anaphoric! We expose this object so that the `eval(text)` below will have it in-scope.
    E.internal.console = {
      ...global.console,
      ...{
        log: (...args) => E.message(args.map(E.string).join(' ')),
        error: (...args) => E.error(args.map(E.string).join(' ')),
        warn: (...args) => E.warning(args.map(E.string).join(' ')),
        assert: (b, msg = '') => (b ? 'Assertion Passed' : E.error(`Assertion failed.${msg}`))
      }
    }
    text = text.replace(/console\.log/g, 'E.internal.console.log')
    text = text.replace(/console\.error/g, 'E.internal.console.error')
    text = text.replace(/console\.warn/g, 'E.internal.console.warn')
    text = text.replace(/console\.assert/g, 'E.internal.console.assert')

    E.internal.require = { NODE_PATH: E.shell('npm root -g') }
    let now = E.shell('date +%H:%M:%S')

    E.internal.log.append(`\n\n[${now}]<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n`)

    // By default `var left = right` performs a side-effect and so evaluates to `undefined`, but it's more useful
    // for the user to see the value of `left`, so let's save that for future use below ---if any.
    // This also works for `async function f (args) {body}`.
    // Note: We do this before any cloberring rewrites.
    let echoableLeftSide =
      (text.match(/^(\s*)var([^=]*)=/) || [])[2] || (text.match(/^(\s|async)*function(\s*)(\w*)/) || [])[3]

    if (text.match(/^\s*let/)) {
      E.internal.log.append(`// “let” clauses declare local variables whose life ends when CMD+E is done;\n`)
      E.internal.log.append(`// i.e., you wont be able to use this variable in your next CMD+E press.\n`)
      E.internal.log.append(`// Consider using “var” if you really want a global variable.\n\n`)
    }
    if (text.includes('await')) {
      const maybeEcho = !echoableLeftSide ? '' : `.then(_ => E.internal.echoFunction(${echoableLeftSide}))`
      text = `(async () => {\n\n${text}\n\n})()${maybeEcho}.catch(e => E.error(\`\${e}\`))`

      if (!text.includes('E.message'))
        E.internal.log.append('// Async operation encountered; consider using “E.message” to see results.\n')

      let lets = text.match(/(var)\s*({|\[)([^;]*)(}|]) = [^;\n]*/g)
      // Keep track of RHS expressions; we don't want to evaluate them multiple times!
      // E.g.,  `var {x, y} = await complexQuery` should evaluate the RHS only once.
      let identifiers = {} // This names the RHS in the shape `E.internal[someUUID]`
      let declared = {} // This flags whether the new internal name has been declared already or not. We want one declaration!
      lets?.forEach(local => {
        // Replace `...var {x, y} = obj...` with `...uuid = obj;  x = obj.x;  y = obj.y...`
        let [entireExp, keyword, openBraket, vars, closeBracket, obj] = local.match(/(var)\s*({|\[)(.*)(}|\]) = (.*)/)
        if (!identifiers[obj]) identifiers[obj] = require('crypto').randomUUID()
        const declare = obj => {
          if (declared[obj]) return ''
          declared[obj] = true
          return `E.internal['${identifiers[obj]}'] = ${obj}\n`
        }

        vars = vars.replace(/\s/g, '').split(',')
        // [Below is fancy version of:] text = text.replace(local, vars.map(name => `${name} = (${obj}).${name}`).join(';'))
        const rewriteListDestructure = (name, index) => {
          const restParam = name.includes('...')
          const suffix = restParam ? `.slice(${index})` : `[${index}]`
          if (restParam) name = name.replace('...', '')
          return `${declare(obj)} ${name} = E.internal['${identifiers[obj]}']${suffix}`
        }
        text = text.replace(
          local,
          vars
            .map((name, index) =>
              openBraket == '{'
                ? `${declare(obj)} ${name} = E.internal['${identifiers[obj]}'].${name}` // RHS is an object
                : rewriteListDestructure(name, index)
            )
            .join('\n')
        )
      })
      // 🚀 Any non-desctruring let/const just gets ommited!
      text = text.replace(/(var)((\w|\s|,|\[|\])*)(=)/g, '$2 = ')
    }
    E.internal.log.append(E.string(text))

    global.E = E
    global.vscode = vscode
    global.commands = commands
    let result = (1, eval)(text)

    E.internal.log.append('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n')
    E.internal.log.append(E.string(result))

    let functionNames = text
      .replace(/\s*/g, '')
      ?.match(/function\s*[^\)]*/g)
      ?.forEach(x => {
        let args = x?.split('(')[1]?.split(',')
        let name = x?.match(/function\s*([^\(]*)/)[1]
        if (args?.includes('E')) commands[name] = (1, eval)(name)
      })

    if (currentPrefixArgument) {
      E.insert(`\n${result}`)
      return
    }

    E.internal.log.append(echoableLeftSide) // ! remove

    // Text with await tries to do its own echoing above.
    if (text.includes('await')) return

    // E.g., for a side-effectful operation, like setting a var?
    // The use of `echoableLeftSide` means if text is `var l = r` then output the value of `l` .
    // The use of (parens) is for object literals: {x, y} is a block; ({x, y}) is an object literal.
    if (echoableLeftSide) {
      E.internal.echoFunction((1, eval)(`(${echoableLeftSide})`))
      return
    }

    if (result === undefined || E.string(result) === '{}') return

    E.internal.echoFunction(result)
  }

  // ================================================================================

  return E
}
