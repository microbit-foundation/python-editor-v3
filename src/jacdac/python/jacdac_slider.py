# microbit-module: jacdac_slider@0.0.1
"""
A Jacdac slider (or rotary potentiometer) for the micro:bit.

Give it a role name and assign that role to a physical sensor in the Jacdac
sidebar (Config), or try it in the simulator. Poll it in your main loop::

    from jacdac_slider import jacdac_slider

    volume = jacdac_slider("volume")
    while True:
        display.show(str(volume.value()))

POC note: this is a stub. Running Jacdac sensors on the device/simulator needs
the Jacdac-enabled Python runtime (Task 1); until then the methods return
default values.
"""


class jacdac_slider:
    """A Jacdac slider or rotary potentiometer.

    :param role: the role name used to bind this slider to a physical sensor.
    """

    def __init__(self, role):
        self._role = role

    def value(self):
        """Return the current value, from 0 to 100."""
        return 0
