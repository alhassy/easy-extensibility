// Overall Goal: VSCode is a living JavaScript interpreter,
// so we should be able to execute arbitrary JS to alter VSCode on-the-fly.

//🔥 Type the following in *ANY EDITOR* window, 
// then press cmd+e to see things changing live!


editor.options.cursorStyle = 2 // 1 default; 2 filled; 3 underline


// Using the default low-level vscode API
vscode.commands.executeCommand('editor.action.toggleMinimap')


// Using the new user-friendly “E API”
E.toggle.lineNumbers()


let [uncle, ben] = 'With great power, comes great responsibility'.split(',')
E.overlay(uncle); E.warning(ben.toUpperCase())



// cmd+e to register a function, then cmd+h to invoke it!
async function bye(E) {
  let { stdout } = await E.shell('cowsay -f stegosaurus "Enjoy!"')
  E.insert(stdout)
}

/*
 ________ 
< Enjoy! >
 -------- 
\
 \                           / `.   .' " 
  \                  .---.  <    > <    >  .---.
   \                 |    \  \ - ~ ~ - /  /    |
         _____          ..-~             ~-..-~
        |     |   \~~~\.'                    `./~~~/
       ---------   \__/                        \__/
      .'  O    \     /               /       \  " 
     (_____,    `._.'               |         }  \/~~~/
      `----.          /       }     |        /    \__/
            `-.      |       /      |       /      `. ,~~|
                ~-.__|      /_ - ~ ^|      /- _      `..-'   
                     |     /        |     /     ~-.     `-. _  _  _
                     |_____|        |_____|         ~ - . _ _ _ _ _>

*/