// Grab HTML document elements
var languageSelect = document.getElementById("language");
var codeTextArea = {
  clean: document.getElementById("code_block_clean"),
  dirty: document.getElementById("code_block_dirty")
}

// Map of programming language printf templates
var languageMap = {
  "C": "printf(\"DEBUGULAR: $$\");",
  "C#": "Console.WriteLine(\"DEBUGULAR: $$\");",
  "C++": "Console::WriteLine(\"DEBUGULAR: $$\");",
  "Java": "System.out.println(\"DEBUGULAR: $$\");",
  "Javascript": "console.log(\"DEBUGULAR: $$\");",
  "Javascript (alert)": "alert(\"DEBUGULAR: $$\");",
  "JourneyApps": "dialog(\"DEBUGULAR: $$\");",
  "Objective-C": "NSLog(@\"DEBUGULAR: $$\");",
  "Python": "print(\"DEBUGULAR: $$\")",
  "Ruby": "puts \"DEBUGULAR: $$\"",
  "Swift": "print(\"DEBUGULAR: $$\")",
  "VB": "Console.WriteLine(\"DEBUGULAR: $$\")"
};
// Add languages to select
for(item in languageMap) {
  var option = document.createElement("option");
  option.text = item;
  option.value = item;
  languageSelect.add(option);
}

// Set language's initial value
languageSelect.value = "Javascript";

// Set language to localStorage value if exists
if(localStorage.getItem("language") !== null) {
  languageSelect.value = localStorage.getItem("language");
}

// Store language change in localStorage
languageSelect.addEventListener("change", function() {
  localStorage.setItem("language", languageSelect.value);
});

// Listen for changes on clean code textarea
codeTextArea.clean.addEventListener("input", function(e) {
  codeTextArea.dirty.value = debugify(codeTextArea.clean.value, languageSelect.value);
}, false);

// Listen for changes on dirty code textarea
codeTextArea.dirty.addEventListener("input", function(e) {
  codeTextArea.clean.value = undebugify(codeTextArea.dirty.value, languageSelect.value);
}, false);

// Add printf lines between normal lines containing "DEBUGULAR" string
function debugify(cleanCode, lan) {

  // Current Rules:
  // a-a) If line contains opening bracket, copy next line's whitespace
  // a-b) Else copy line's whitespace
  // b) If next line's first non whitespace character is '{', don't add.

  var template = languageMap[lan];

  var dirtyLines = cleanCode.split('\n');
  var lineCount = dirtyLines.length;
  for(var i = 0; i < lineCount; i++) {
    var currentLine = dirtyLines[i];
    var nextLine = dirtyLines[i + 1];
    var nthLine = template.replace('$$', (i+1));
    if(nextLine !== undefined) {
      if(nextLine.trim().charAt(0) === "{") { continue; }
      if(currentLine.indexOf("{") > 0) {
        // Use nextLine's whitespace
        var whitespace = getLeadingWhitespace(nextLine);
        dirtyLines[i] = dirtyLines[i] + "\n" + whitespace + nthLine;
      } else {
        // Use currentLine's whitespace
        var whitespace = getLeadingWhitespace(currentLine);
        dirtyLines[i] = dirtyLines[i] + "\n" + whitespace + nthLine;
      }
    }
  }

  // Append line in the front
  var whitespace = getLeadingWhitespace(dirtyLines[0]);
  var zeroithLine = whitespace + template.replace('$$', 0);
  dirtyLines.unshift(zeroithLine);

  return dirtyLines.join('\n');
}

// Remove all lines containing "DEBUGULAR"
function undebugify(dirtyCode, lan) {
  var template = languageMap[lan];
  var cleanLines = dirtyCode.split('\n');
  for(var i = cleanLines.length - 1; i >= 0; i--) {
    if(cleanLines[i].indexOf("DEBUGULAR") > 0) {
      cleanLines.splice(i, 1);
    }
  }
  return cleanLines.join('\n');
}

// Find and return the whitespace before the first non-whitespace character in string
function getLeadingWhitespace(lineCode) {
  var regex = /(^\s+)/g;
  var whitespace = "";
  var matches = regex.exec(lineCode);
  if(matches !== null && matches.length > 0) { whitespace = matches[0]; }
  return whitespace;
}