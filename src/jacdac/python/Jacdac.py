"""
Jacdac sensors for the micro:bit.

Plug-and-play Jacdac sensors, each addressed by a *role name* that you choose.
Assign each role to a physical sensor in the Jacdac sidebar (Config), or try it
out with the simulator.

Unlike MakeCode, there are no event handlers: poll the sensors from your main
loop instead, e.g.::

    from microbit import *
    import Jacdac

    start = Jacdac.Button("start")
    volume = Jacdac.Slider("volume")

    while True:
        if start.was_pressed():
            display.show(str(volume.position()))

POC note: these are stubs. Running Jacdac sensors on the device/simulator needs
the Jacdac-enabled Python runtime (Task 1); until then the methods return
default values.
"""


class Button:
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


class RotaryEncoder:
    """A Jacdac rotary encoder (a knob you turn).

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


class Slider:
    """A Jacdac slider or rotary potentiometer.

    :param role: the role name used to bind this slider to a physical sensor.
    """

    def __init__(self, role):
        self._role = role

    def value(self):
        """Return the current value, from 0 to 100."""
        return 0
