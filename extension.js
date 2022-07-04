const vscode = require('vscode');

function activate(context) {
	context.subscriptions.push(vscode.commands.registerCommand('easy-extensibility.evaluateSelection',
		() => vscode.window.showInformationMessage('Hello World from easy-extensibility, eh 1!')));

	context.subscriptions.push(vscode.commands.registerCommand('easy-extensibility.executeRegisteredCommand',
		() => vscode.window.showInformationMessage('Hello World from easy-extensibility, eh 2!')));
}

module.exports = {
	activate,
	deactivate: () => {}
}
