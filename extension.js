/** Overall Goal: VSCode is a living JavaScript interpreter, so we should be able to execute arbitrary JS to alter VSCode on - the - fly.
 *
 * The intent is you can quickly build extensions quickly by registering them with `cmd+e` then calling them with `cmd+h`.
 *
 * - There is no edit-load-debug cycle; just edit-then-use!
 * - Then when you're happy with what you have, you form a full extension ---involved default approach 😱!
 * - Or, better yet, save your extensions in an `init.js` file --- new lightweight approach 🤗!
 *
 * # Accessibility
 * - Invoke`cmd+h tutorial` to read the tutorial on using this extension.
 * - To learn about “saving reusable functions and having them load automatically”, invoke`cmd+h find users init.js file, or provide a template`.
 */

/* [Personal Note] Select the following fragment, then cmd+e to produce the snippets that provide code completion with docstrings.

let file = require('fs').readFileSync('/Users/musa/easy-extensibility/extension.js').toString()
let pattern = /\*\*([\S\s]*?)\*\/\sE\.([^=]*)=((.*)=>)?(.*)/g
let snippets = {}
file.match(E.pattern).forEach(it => {
  let [_, docs, name, __, args, ___] = /\*\*([\S\s]*?)\*\/\sE\.([^=]*)=((.*)=>)?(.*)/.exec(it)
  let key = docs.split('\n')[0]
  args = args?.trim() || ''
  if (args.startsWith('(')) {
    args = args.replace(/\(|\)/g, '') // remove parens
    args = args.split(',').map((it, i) => '${' + (i + 1) + ':' + it + '}') // Add tab stops along with param hints
    args = args.join(',')
    args = `(${args})`
  } else args = `(${args})`
  snippets[key] = { prefix: `E.${name}`, body: `E.${name.trim()}${args}` + '$0', description: docs }
})
// make the json file!
require('fs').writeFileSync('/Users/musa/easy-extensibility/E-snippets.json', JSON.stringify(snippets))
*/

// vscode, E, commands ================================================================================

const vscode = require('vscode')

/** User-defined commands that are invoked by `cmd+h`, or via their declared keybinding.
 *
 * This is a names-to-functions associations object.
 *
 * ### Three ways to register commands for use with `cmd+h` (or their own keybinding)
 *
 * 1. Invoke `cmd+e` on a selection of text that contains a JS `function` which happens
 *    to have a parameter *named* `E`.
 *    ```
 *    // Run an arbitrary command-line function on the current file; namely prettier.
 *    function prettifyFile (E) { E.shell(`prettier --write ${E.currentFileName()}`) }
 *    ```
 *    Functions that do not contain a parameter named `E` are still registed
 *    for future use, but are not exposed as interactive commands in the user's
 *    personal command pallete, `cmd+h`. Moreover, `const f = E => ...` functions
 *    are a middle-ground: They contain `E` as an argument, but are not exposed
 *    in the `cmd+h` pallete.
 *
 * 2. Attach a function to the `commands` object:
 *    ```
 *    // Run an arbitrary command-line function on the current file; namely prettier.
 *    commands["Prettify current file"] = E => E.shell(`prettier --write ${E.currentFileName()}`)
 *    ```
 *
 *    The second approach has the benefit of providing a user-friendly-name to the command
 *    when it appears in the `cmd+h` command pallete; whereas the former uses whatever the function name happens to be.
 *
 * 3. Attach a function to the `commands` object **as well** as a keybinding:
 *    ```
 *    // Now "Alt+Space W" will echo some forunte/wisdom to you in the bottom-left corner of your VSCode.
 *    commands['Give me some wisdom!'] = { "alt+space w": E => E.message(E.shell("fortune")) }
 *
 *    // Now "Cmd+i d" and "Cmd+i t" will insert the current date and time, respectively.
 *    commands["Insert date"] = { "cmd+i d": E => E.insert(E.shell("date +%Y-%m-%d")) }
 *    commands["Insert time"] = { "cmd+i t": E => E.insert(E.shell("date +%H:%M:%S")) }
 *    ```
 *
 *    Of-course these commands are also accessible via the user pallete `cmd+h`.
 *
 * 🤔 Every function, attached in either of the two ways, must accept `E` and `vscode` as its first two arguments.
 * That is, `cmd+h` invokes functions within `commands` by providing them with two arguments `E, vscode`.
 * - As parameters, user's may use whatever names they like; e.g., `function shout (fancy, old) { fancy.message("HELLO") }`
 *   but we suggest the standard names instead: `function shout (E, vscode) { E.message("Hello") }`.
 */
let commands = {}

var E = require('vscodejs')(vscode)

// Need this here so that it “inherits” the definition of `require`.
E.internal.eval.require = (pkg, explicitPath = 'index.js') => {
  let attempt = path => {
    try {
      return require(`${E.internal.require.NODE_PATH}/${pkg}/${path}`)
    } catch (e) {
      return
    }
  }
  // The first `require` below is for built-in packages, like `fs`.
  return (
    require(pkg) || attempt(explicitPath) || attempt('src/index') || attempt('lib/index') || attempt(`bundle/${pkg}`)
  )
}

// init.js ================================================================================

commands["Open the tutorial; I'd like to learn more about using cmd+E!"] = E => {
  E.shell(
    'rm ~/Downloads/tutorial.js; curl -o ~/Downloads/tutorial.js https://raw.githubusercontent.com/alhassy/easy-extensibility/main/tutorial.js'
  )
  E.findFile('~/Downloads/tutorial.js')
}

commands["Find user's ~/.init.js file, or provide a template"] = E =>
  E.findFile('~/.init.js', _ =>
    E.shell(
      'curl -o ~/.init.js https://raw.githubusercontent.com/alhassy/easy-extensibility/main/init.js; code ~/.init.js'
    )
  )

//* After “E” has been sufficiently defined, we load the user's “~/.init.js” file.
//* The current implementation treats the user's init file as if it were semi-dynamically-scoped:
//* The “~/.init.js” file may mention “E, commands, vscode” with no ceremonial import of any kind!
//* (This is similar to the use of the keyword `this` in object-oriented programming: It's an implicitly introduced argument!)

commands['Reload ~/.init.js file'] = E => {
  E.readFile('~/.init.js').then(text => {
    // Rather than just `eval(text)`, the following allows users to make use of `await` clauses liberally.
    // That is, the user's `~/.init.js` file can make liberal use of `await` clauses as a syntactic sugar for an ambient async IIFE.
    eval(`(async () => { ${text} })()`)
    E.message('~/.init.js loaded!')
  })
}

//!! Actually load the file upon startup!
commands['Reload ~/.init.js file'](E)

// ================================================================================

function activate(context) {
  /** Now that we have `context` in-scope, let's alter `commands`
   *  so that it supports having keybindings alongside command definitions.
   */
  commands = new Proxy(commands, {
    set(obj, prop, value) {
      if (typeof value === 'object') {
        let keys = Object.keys(value)
        if (keys.length > 1) {
          E.error(`Only 1 key-value pair allowed as value for “commands["${prop}"]”!`)
          return
        }
        let key = keys[0]
        let fun = value[key]

        try {
          context.subscriptions.push(vscode.commands.registerCommand(prop, () => obj[prop](E)))
        } catch (e) { }
        E.bindKey(key, prop)

        obj[prop] = fun
      } else Reflect.set(...arguments)
    }
  })

  // Let's expose some `E.internal` functions as commands (`cmd+shift+p`)-visibile by this extension.
  let register = name =>
    context.subscriptions.push(
      vscode.commands.registerCommand(`easy-extensibility.${name}`, E.internal[name](commands))
    )
  register('evaluateSelection')
  register('executeRegisteredCommand')
}

module.exports = {
  activate,
  deactivate: () => { }
}
