import { PinchButton } from "./SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import TrackedHand from "./SpectaclesInteractionKit/Providers/HandInputData/TrackedHand";
import { SIK } from "./SpectaclesInteractionKit/SIK";

@component
export class HandButton extends BaseScriptComponent {
  @input
  private button: PinchButton;
  private leftHand: TrackedHand = SIK.HandInputData.getHand("left");

  onAwake() {
    this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
    this.createEvent("UpdateEvent").bind(this.update.bind(this));
  }

  private update() {
    if (this.leftHand.isTracked()) {
      const buttonTransform = this.button.getTransform();
      const leftHandTransform = this.leftHand.getSceneObject().getTransform();

      // Copy TRS of the button to the world coordinates of the left hand
      buttonTransform.setWorldRotation(leftHandTransform.getWorldRotation());
      buttonTransform.setWorldPosition(
        this.leftHand
          .getPalmCenter()
          .add(leftHandTransform.back.uniformScale(5))
          .add(leftHandTransform.left.uniformScale(3))
      );
    }
  }

  private onStart() {
    // Show the button when the left hand is seen
    this.leftHand.onHandFound.add(() => {
      this.button.sceneObject.enabled = true;
    });

    // Hide the button when the left hand is not seen
    this.leftHand.onHandLost.add(() => {
      this.button.sceneObject.enabled = false;
    });
  }
}
