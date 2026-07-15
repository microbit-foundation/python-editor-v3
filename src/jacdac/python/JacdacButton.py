# microbit-module: JacdacButton@0.0.1
"""
A Jacdac push-button for the micro:bit.

Give it a role name and assign that role to a physical sensor in the Jacdac
sidebar (Config), or try it in the simulator. Poll it in your main loop::

    from JacdacButton import JacdacButton

    start = JacdacButton("start")
    while True:
        if start.was_pressed():
            display.show(Image.HAPPY)

POC note: this is a stub. Running Jacdac sensors on the device/simulator needs
the Jacdac-enabled Python runtime (Task 1); until then the methods return
default values.
"""


class JacdacButton:
    """A Jacdac push-button.

    :param role: the role name used to bind this button to a physical sensor.
    """

    def __init__(self, role):
        self._role = role

    def is_pressed(self):
        """Return ``True`` if the button is currently pressed."""
        return False

    def was_pressed(self):
        """Return ``True`` if the button was pressed since this was last called.

        Calling this resets the pressed state, so each press is reported once.
        """
        return False

    def get_presses(self):
        """Return the number of presses since this was last called, then reset."""
        return 0

    def pressure(self):
        """Return the pressure on the button, from 0 (open) to 100 (fully pressed).

        Plain buttons report 0 or 100; analog buttons report values in between.
        """
        return 0
