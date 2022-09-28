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
*/