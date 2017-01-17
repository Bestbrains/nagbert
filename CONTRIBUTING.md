## Styleguides

* Follow the JavaScript coding style with details from `.jscsrc` and `.editorconfig` files and use necessary plugins for your text editor.

### General Code

* End files with a newline.
* Place requires in the following order:
  * Built in Node Modules (such as `path`)
  * Local Modules (using relative paths)
* Avoid platform-dependent code:
  * Use `path.join()` to concatenate filenames.
* Using a plain `return` when returning explicitly at the end of a function.
  * Not `return null`, `return undefined`, `null`, or `undefined`

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally
