# easy-extensibility README

Extend VSCode without the ceremony of making a full extension! Just write your code anywhere and it'll be part of VSCode!

## TODO Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

There is essentially only one step (⭐) to making an extension.
🤗 Sharing an extension, such as a tiny 5-line command, should be as easy as having that defintion code readily available.

In constrast, the default approach to making a VSCode extension is as follows:
1. 😱 Make a new NodeJS project, say with `yo code` as per https://code.visualstudio.com/api/get-started/your-first-extension
2. ⭐ Actually write your extension's code
3. 😱 Run your code in a dedicated sandbox with `F5`, far from your code
4. 😱 Try your extension; stop the sandbox; alter your code; repeat.
5. Now to actually make use of your extension, you should pacakge it with `vsce package`
   - To share it with others, you'll need to:
      0. 😱 Make a Microsoft account
      1. 😱 Make a new Azure organisation, as in https://dev.azure.com/alhassy      
      2. 😱 Create a Personal Access Token for use in the extension marketplace; as per https://code.visualstudio.com/api/working-with-extensions/publishing-extension

This approach doesn't encourage making extensions ---since there's so much ceremony--- and it, likewise, doesn't encourage sharing/packaging up the resulting (tiny) extensions.

## Development

0. `cd ~/easy-extensibility; npm ci`
1. `code ~/easy-extensibility`
2. `F5`
3. In the new VSCode instance, `Cmd+Shift+P` then `Hello World` to see things run.

## TODO Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## TODO Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## TODO Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## TODO Release Notes

Users appreciate release notes as you update your extension.


All notable changes to the "easy-extensibility" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.
