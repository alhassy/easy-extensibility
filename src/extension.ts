import * as vscode from 'vscode';
import * as fs from 'fs';
import * as HJSON from 'hjson';
import { randomUUID } from 'crypto';

//const vscodejs: any = require('vscodejs');
import vscodets from './vscodets';
let E: any = vscodets(vscode);

// ...existing code...

/* [Personal Note] Select the following fragment, then cmd+e to produce the snippets that provide code completion with docstrings.
   ...existing comment...
*/

// vscode, E, commands ================================================================================

const conf = vscode.workspace.getConfiguration("easy-extensibility").get;
const rcfile = conf("rcFile");

// ...existing code for commands and functions...

let commands: any = {};

E.ignoreErrors = (body: () => any) => {
  try {
    return body();
  } catch (e) {
    return;
  }
};

E.internal = E.internal || {};
E.internal.eval = E.internal.eval || {};
E.internal.eval.require = (pkg: string) =>
  E.ignoreErrors(() => require(pkg)) || require(`${E.internal.require.NODE_PATH}/${pkg}`);

// ...existing code for init.js commands...

commands["Open the tutorial; I'd like to learn more about using cmd+E!"] = (E: any) => {
  E.shell(
    `rm ${E.expanduser("~/Downloads/tutorial.js")}; curl -o ${E.expanduser("~/Downloads/tutorial.js")} https://raw.githubusercontent.com/alhassy/easy-extensibility/main/tutorial.js`
  );
  E.findFile(E.expanduser('~/Downloads/tutorial.js'));
};

commands["Find user's rc file, or provide a template"] = (E: any) => {
  let rc = E.expanduser(rcfile);
  E.findFile(rc, () =>
    E.shell(
      `curl -o ${rc} https://raw.githubusercontent.com/alhassy/easy-extensibility/main/init.js; code ${rc}`
    )
  );
};

commands['Reload rc file'] = (E: any) => {
  let rc = E.expanduser(rcfile);
  E.readFile(rc).then((text: string) => {
    eval(`(async () => { ${text} })()`);
    if(conf("showMessageOnRCLoad", true)) {
      E.message(`${rc} loaded!`);
    }
  });
};

commands['Reload rc file'](E);

// =====================================================================================================================

// TODO: This is not yet released!
E.withJSON = (file: string, callback: (data: any) => void, newFile?: boolean) => {
  file = file.replace(/~/g, process.env.HOME as string);
  try {
    let data = newFile ? {} : HJSON.parse(fs.readFileSync(file).toString());
    callback(data);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`🤯 Oh no! ${error}`);
    console.error(callback.toString());
    process.exit(0);
  }
};

// =====================================================================================================================

// ...existing code...

function activate(context: vscode.ExtensionContext): void {
  // ...existing code...

  E.registerCommand = (...args: [string, (...args: any[]) => any]) => {
    context.subscriptions.push(vscode.commands.registerCommand(...args));
    return args;
  };

  // ...existing code...
  E.bindKey = (key: string, command: any, when: string = 'editorTextFocus') => {
    let commandName: string | undefined;
    if (typeof command === 'function') {
      commandName = `anonymousBindKeyCommand${randomUUID().replace(/-/g, '')}`;
      E.ignoreErrors(() => E.registerCommand(commandName, () => command(E)));
    }
    E.withJSON(E.internal.bindKey.path, (keys: any) => {
      E.warning(`${keys}`);
      const alreadyBound = keys.find((binding: any) => binding.key === key);
      if (alreadyBound) {
        alreadyBound.command = commandName || command;
        alreadyBound.when = when;
        return;
      }
      keys.push({ key, command: commandName || command, when });

      E.message(keys.map(JSON.stringify));
    });

    E.message(`“${key}”: ${command}`);
  };

  commands = new Proxy(commands, {
    set(obj, prop, value): boolean {
      if (typeof value === 'function') {
        obj[prop] = value;
        E.ignoreErrors(() => E.registerCommand(prop, () => obj[prop](E)));
      }
      if (typeof value === 'object') {
        let keys = Object.keys(value);
        if (keys.length > 1) {
          E.error(`Only 1 key-value pair allowed as value for “commands["${String(prop)}"]”!`);
          return false;
        }
        let key = keys[0];
        let fun = value[key];
        E.ignoreErrors(() => E.registerCommand(prop, () => obj[prop](E)));
        E.bindKey(key, prop);
        obj[prop] = fun;
        return Reflect.set(obj, prop, fun);
      } else {
        return Reflect.set(obj, prop, value);
      }
    }
  });

  E.registerCommand('easy-extensibility.evaluateSelection', E.internal.evaluateSelection(commands));
  E.registerCommand('easy-extensibility.executeRegisteredCommand', E.internal.executeRegisteredCommand(commands));

  async function initialization() {
    let nodeModulesDirectory: string | undefined = conf("nodeModules");
    if (nodeModulesDirectory && fs.existsSync(nodeModulesDirectory) && fs.lstatSync(nodeModulesDirectory).isDirectory()) {
      E.node_path = nodeModulesDirectory;
    } else {
      E.node_path = E.shell(conf("npmCommand") + " root -g");
    }
  };

  initialization();
}

// =====================================================================================================================

export function deactivate(): void {}

export { activate };
