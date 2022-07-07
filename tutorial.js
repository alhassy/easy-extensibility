//!! README: Press `cmd+e` on any line to evaluate it! Or select multiple line, then `cmd+e`.

// ===================================================================================
// ====================== Quickly! What does this extension do!? =====================
// ===================================================================================

// Overall Goal: VSCode is a living JavaScript interpreter, 
// so we should be able to execute arbitrary JS to alter VSCode on-the-fly.

// Type the following in *ANY EDITOR* window, then press cmd+e to see things changing live!

E.toggle.screencast() // Show's every key I press, for onlookers! So neato!
editor.options.lineNumbers = 1 // Show line numbers? 0 = off; 1 = on; 2 = relative
editor.options.cursorStyle = 2 // 1 thick line; 2 filled block; 3 underline; 4 thin line; 5 block outline; 6 thin underline

// Using the default low-level vscode API
vscode.commands.executeCommand('breadcrumbs.toggle')

// Using the new “E API”: Let's make VSCode super minimal.
E.toggle.panel(); E.toggle.sideBar(); E.toggle.activityBar(); 
E.toggle.breadcrumbs(); E.toggle.tabs(); E.toggle.lineNumbers();
E.toggle.statusBar(); E.toggle.minimap()

// cmd+e to register a function, then cmd+h to invoke it!
async function smile (E) { let {stdout} = await E.shell('fortune'); E.insert(stdout) }

// No more messing with configs, or making full-on extensions, just to try things out!

// Moreover, this extension lets us use VSCode as a platform for quickly making new applications;
// i.e., VSCode acts as the GUI and JavaScript is the implementation language for the new app.
// E.g., we can use `E.browseURL` to make a "bookmark app" that shows a dropdown list of useful webpages
// that you are currently reading from time to time, and opens your default browser when you pick one of them.


// ===================================================================================
// ======================= Okay, tell me more about this cmd+E =======================
// ===================================================================================


// Cmd+E acts as a "JS evaluator" that works anywhere, in any kind of Vscode window.
120 / 4 // cmd+E spits out "30 ~ number"
({name: "Musa", age: 2 * 14 + 2}) // cmd+E shows the stringified object

// What about variables?
//
let it = 3 // cmd+e evaluates this in a local session, which does not persist between cmd+e sessions
//
// These will presist between cmd+e sessions, since cmd+e is aware of these special objects
vscode.it = 3 
E.it = 4
E.it // cmd+E spits out "4 ~ number"

// We could use {braces} for the lifetime of variables: Select the following and press cmd+E!
{
	let x = 1
	let y = 2
	x + y
} // Spits out 3
// For cmd+E: The last expression in a {block} is the value of the entire evaluated block.
//
// More interesting example:
{
	let t = vscode.window.createTerminal("Neato extensibility!")
	t.sendText("pwd")
	t.show(true)
}

// The above is packaged-up nicely as:
E.terminal("pwd")

// ===================================================================================
// ========================== So what are 'vscode' and 'E'? ==========================
// ===================================================================================

vscode.window.showInformationMessage("Hello, world!")
// or using the more friendly E api:
E.message("hi")

// Some more E utitilies...

E.insert("hola")

// Textually insert all file names in the ~/ directory
E.shell('cd ~; ls').then(x => E.insert(x.stdout))

// Greet the user!
E.shell("whoami").then(x => E.message("Hello, " + x.stdout.toUpperCase()))

// Run a terminal with the given command (Press cmd+j to toggle terminal visibility!)
// (I have this one saved; it makes me smile!)
E.terminal('fortune | cowsay | lolcat')


// ===================================================================================
// ================================ Reusable Functions ===============================
// ===================================================================================

// We can wrap these tiny utilities into reusable functions, and register them immediately too!
// Select the following function, then cmd+E, then "cmd+h now RETURN" to invoke it.

/* Inserts the current date at the location of your cursor. */
async function now (E) { let {stdout} = await E.shell('date'); E.insert(stdout) }

// "cmd+h now" inserts the following: Tue  5 Jul 2022 08:01:35 EDT

// We can make handy-dandy utility functions, of any kind and then use them immediately!
// E.g., select the following function, press cmd+E to register it.

function reverseSelection (E) {
	const words = E.selection();
	const reversed = words.split('').reverse().join('');
    E.replaceSelection(reversed);
}

// Now, select the following text and invoke "cmd+h reverseSelection" a few times to see the selected text change!
"Hello, there friends! Isn't extensibility neato!"

// 😱 Under normal circumstances, this super tiny reverse utility has to be formed into a full-blown extension!
// 😱 Indeed, it's one of the standard examples! https://github.com/Microsoft/vscode-extension-samples/tree/main/document-editing-sample
// 😱 A full-blown extension for a utility like this is overkill. Whence our easy-extensions package! 🤗

//!! To learn about “saving these reusable functions and having them load automatically”, please invoke “cmd+h find users init.js file, or provide a template”