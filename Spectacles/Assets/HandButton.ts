import { PinchButton } from "./SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import TrackedHand from "./SpectaclesInteractionKit/Providers/HandInputData/TrackedHand";
import { SIK } from "./SpectaclesInteractionKit/SIK";

@component
export class HandButton extends BaseScriptComponent {
  // Inputs to the script component
  @input private chirality: boolean;  // False -> Left : True -> Right
  @input private button: PinchButton;
  @input private txobj: SceneObject;

  // Private internal class variables
  private leftHand: TrackedHand = SIK.HandInputData.getHand("left");
  private rightHand: TrackedHand = SIK.HandInputData.getHand("right");
  private hand: TrackedHand;

  // When the script wakes up
  onAwake() {
    // Choose the hand to attach to
    this.hand = this.chirality ? this.rightHand : this.leftHand;

    // Set up events
    this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
    this.createEvent("UpdateEvent").bind(this.update.bind(this));
  }

  // Every frame
  private update() {
    // If the hand is being tracked, transform the scene object to the hand
    if (this.hand.isTracked()) {
      const transform = this.txobj.getTransform();
      const handTransform = this.hand.getSceneObject().getTransform();

      // Copy TRS of the scene object to the world coordinates of the hand
      transform.setWorldRotation(handTransform.getWorldRotation());
      transform.setWorldPosition(
        this.hand
          .getPalmCenter()
          .add(handTransform.back.uniformScale(5))
          .add(handTransform.left.uniformScale(3))
      );
    }
  }

  // On start
  private onStart() {
    // Show the button when the hand is seen
    this.hand.onHandFound.add(() => {
      this.button.sceneObject.enabled = true;
    });

    // Hide the button when the hand is not seen
    this.hand.onHandLost.add(() => {
      this.button.sceneObject.enabled = false;
    });
  }
}
