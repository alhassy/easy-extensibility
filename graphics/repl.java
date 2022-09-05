// Press “C-x C-e” to evaluate a Java term.
// Blog article associated with this GIF: https://www.alhassy.com/making-vscode-itself-a-java-repl

// Is this JavaScript ??? 😜
var hello = "world!";
// Naahhh!
String jokes = "It's Java caffine!".toUpperCase();

// Useful error messages
var whoops = nope - 1 / 0;

// Define classes, functions, and instances:
class User { String name; int age; }
//
String speak1(User me) { return String.format("I'm %s-year-old %s!", me.age, me.name); }
Function<User, String> speak2  =  me -> String.format("I'm %s-year-old %s!", me.age, me.name)
//
User me = new User() {{
   name = System.getProperty("user.name");
   age = new Random().nextInt(100); }}

// Let's do a method call (on the “speak” function-object)
speak2.apply(me)

// That was super lammmmeeee!!!
// Let's do some gui goodness 😝
import javax. swing.*;
var f = new JFrame();
f.setAlwaysOnTop(true);
JOptionPane.showMessageDialog(f, speak1(me));




/*

commands['Evaluate: Java'] = {
  'ctrl+x ctrl+e': E.REPL({
    command: '/usr/bin/jshell',
    prompt: 'jshell>',
    errorMarkers: [/Error:/, /\|\s*\^-*-/, /\|\s+Exception/, /\|\s+at/, /cannot find symbol/, /symbol:/],
    echo: E.overlay,
    stdout: result => result.includes(' ==> ') ? result.replace('==>', '⮕') : `⮕ ${result} `
  })
}





// Hashnode blog post idea! ================================================================================
// Blog post on (1) how to make a REPL with JS, and (2) how to use VSCode as a seemless GUI frontend for that repl!
//
// MWE for Python REPL ~ Keep for posterity! Namely, a REPL can be made in less than 20 lines!
var { spawn } = require('child_process')
var ts = spawn('python3', ['-i'])
ts.echoFunction = (obj, prefix = '⮕ PYTHON: ') => E.overlay(`${prefix}${obj}`)
ts.stdout.on('data', data => {
  let d = data.toString().replace(/^> /, '')
  if (d.length) ts.echoFunction(d)
})
ts.stderr.on('data', data => ts.echoFunction(data.toString().match('error[^:]*:(.*)')[1], '🚫 '))
commands['Evaluate: Python'] = {
  'ctrl+x ctrl+e': async E => {
    let code = await E.selectionOrEntireLineEOL()
    ts.stdin.write(`${code}\n`)
  }
}


// Repeat about Hashnode blog article but for TS:



// [TypeScript] C-x C-e ================================================================================================
var { spawn } = require('child_process')
var ts = spawn('ts-node', ['-i'])
ts.echoFunction = (obj, prefix = '⮕ ') => E.overlay(`${prefix}${typeof obj == 'object' ? JSON.stringify(obj) : obj} `)
ts.stdout.on('data', data => {
  let d = data.toString().replace(/^> /, '')
  if (d.length) ts.echoFunction(d)
})
ts.stderr.on('data', data => ts.echoFunction(data.toString().match('error[^:]*:(.*)')[1], '🚫 '))

/** Evaluate a selected expression, otherwise move cursor to end of line and evaluate entire line.
 * Then show value in an overlay ---after the selection, or end of line.
 *
 * ### Examples
 * Select then press `Ctrl + x Ctrl + e` on any of the following expressions.
 * ```
  * 2 + 3 // ⮕  5
  *
 * 2 - '3' // 🚫 The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
  *
 * { hi: 1, bye: 2 } // ⮕  {hi: 1, bye: 2}
  *
 * let jump = (x: number, y: number) => x + y
  * jump(1, '2') // 🚫 Argument of type 'string' is not assignable to parameter of type 'number'.
  * ```
 */
commands['Evaluate: TypeScript'] = {
  'ctrl+x ctrl+e': async E => {
    let code = await E.selectionOrEntireLineEOL()
    ts.stdin.write(`${code} \n`)
  }
}

*/
