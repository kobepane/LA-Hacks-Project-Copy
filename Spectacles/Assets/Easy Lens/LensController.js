// Main Controller
//
// Made with Easy Lens

//@input Component.ScriptComponent captionPlaceholder


try {

// Display a placeholder caption at the bottom of the screen
script.captionPlaceholder.text = "Captions: This is a placeholder text.";

} catch(e) {
  print("error in controller");
  print(e);
}
