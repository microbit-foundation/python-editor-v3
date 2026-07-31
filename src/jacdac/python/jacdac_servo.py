# microbit-module: jacdac_servo@0.0.1
"""
A Jacdac servo motor for the micro:bit.

This is an output: give it a role name, assign that role to a physical servo in
the Jacdac sidebar (Config), or watch it in the simulator. Move the arm to an
angle from 0 to 180 degrees, where 90 is the middle::

    from jacdac_servo import jacdac_servo

    gate = jacdac_servo("gate")
    gate.set_angle(90)

POC note: this is a stub. Running Jacdac sensors on the device/simulator needs
the Jacdac-enabled Python runtime (Task 1); until then these methods do nothing.
"""


class jacdac_servo:
    """A Jacdac servo motor.

    :param role: the role name used to bind this servo to a physical servo.
    """

    def __init__(self, role):
        self._role = role

    def set_angle(self, angle):
        """Move the servo arm to an angle, from 0 to 180 degrees (90 is middle)."""

    def off(self):
        """Turn the servo off so it stops holding its position."""
