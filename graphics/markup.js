// # Problem Description                                                                                 #

/** A program is a literate work, written by a human & read by a human ---incidentally also by a machine.
 * This includes not only code formatting, but also marked-up comments/design discussions.
 *
 * VSCode hovers will render markup such as code `name` or `age`, important _warnings_, and
 * even more +important+ cruical *points* nicely. But in the comments, there is no such rendering.
 * Let's fix that!
 */
function superComplexProgram(name, age) { console.log(`Hello ${age}-year old ${name}!`) }

// # Solution                                                                                            #
E.decorateRegexp(/\*[^ ]*\*/, { fontWeight: 'bold' })                                         // *bold*
E.decorateRegexp(/\+[^ ]*\+/, { textDecoration: 'line-through 2px' })                         // +strikethrough+
E.decorateRegexp(/_[^ ]*_/, { textDecoration: 'underline 2px' })                              // _underline_
E.decorateRegexp(/~[^ ]*~/, { fontStyle: 'cursive', textDecoration: 'underline wavy 2px' })  // ~wavey-happy-fun-time~
// Comments are italics by default, so /slashes/ make text empahised by being normal font.
E.decorateRegexp(/\/[^ ]*\//, { fontStyle: 'normal' })
E.decorateRegexp(/`[^ ]*`/, { border: 'double', borderRadius: '3px', borderWidth: '2px' })   // `code`
E.decorateRegexp(/\[.[^ ]*\]/, { border: 'dashed', borderRadius: '3px', borderWidth: '2px' })  // [boxed]

/** [Formatted] text is not just about speaking *boldly* or _underscoring_ points
*  that should be /emphasized/, it can also be about ~fun-and-whimsy~; +lmaof+.
*  Otherwise, it's all just `work`; e.g.,
*  “ This function has arguments being a numeric `age` and a string `name` . ” */

// # Further Reading                                                                                     #
// Easy-Extensibility makes VSCode into a living JavaScript interpreter;
// that can execute arbitrary JS to alter VSCode on-the-fly: Just press “⌘+E” to “E”valuate code!
//
// Blog article associated with this GIF: https://www.alhassy.com/vscode-beautifully-marking-up-comments
// Video Intro to Easy-Extensibility: https://youtu.be/HO2dFgisriQ