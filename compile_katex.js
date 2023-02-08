var config = {
    wrapping_tag: "div",
    latex_class: "math-display-block"
}

const fs = require('fs');
const katex = require('katex');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// The first argument is the input html file, and the optional second argument is the output file
let in_filename = process.argv[2]
let out_filename = process.argv.length == 4 ? process.argv[3] : in_filename;

// Pull the DOM from the HTML file
JSDOM.fromFile(in_filename).then(dom => {
    /*
        Select all divs with the math-display-block class

        Using querySelectorAll instead of getElementsByClassName prevents infinite recursion 
        from occurring because the latter's return value updates when the DOM is changed. 
        This creates a situation where KaTeX adds KaTeX elements which are then passed to KaTeX...
    */
    let equations = dom.window.document.querySelectorAll(config.wrapping_tag + "." + config.latex_class);

    for (let i = 0; i < equations.length; i++) {
        // Get the text (KaTeX) of the div
        let equation = equations[i]
        // Compile it to a string, rendering as a block if specified
        let html = katex.renderToString(equation.textContent, {
            throwOnError: true,
            trust: true,
            displayMode: equation.getAttribute('data-display') === "display",
        });
        // Write the HTML back into the div
        equation.innerHTML = html
    }
    // Serialize the updated dom and write back to the file
    fs.writeFileSync(out_filename, dom.serialize());
});