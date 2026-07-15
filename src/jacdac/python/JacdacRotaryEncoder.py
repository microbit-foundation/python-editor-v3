# microbit-module: JacdacRotaryEncoder@0.0.1
"""
A Jacdac rotary encoder (a knob you turn) for the micro:bit.

Give it a role name and assign that role to a physical sensor in the Jacdac
sidebar (Config), or try it in the simulator. Poll it in your main loop::

    from JacdacRotaryEncoder import JacdacRotaryEncoder

    dial = JacdacRotaryEncoder("volume")
    while True:
        display.scroll(dial.value())

POC note: this is a stub. Running Jacdac sensors on the device/simulator needs
the Jacdac-enabled Python runtime (Task 1); until then the methods return
default values.
"""


class JacdacRotaryEncoder:
    """A Jacdac rotary encoder.

    :param role: the role name used to bind this encoder to a physical sensor.
    """

    def __init__(self, role):
        self._role = role

    def value(self):
        """Return the current value as a click count.

        Starts at 0, increases by 1 per clockwise click and decreases by 1 per
        counter-clockwise click, so it may be negative.
        """
        return 0

    def clicks_per_turn(self):
        """Return how many clicks make up one full 360 degree turn."""
        return 24
