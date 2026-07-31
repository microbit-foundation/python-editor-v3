# microbit-module: jacdac_led_ring@0.0.1
"""
A Jacdac LED ring (a ring of colour LEDs) for the micro:bit.

This is an output: give it a role name, assign that role to a physical LED ring
in the Jacdac sidebar (Config), or watch it in the simulator. Colours are
(red, green, blue) tuples, each from 0 to 255::

    from jacdac_led_ring import jacdac_led_ring

    ring = jacdac_led_ring("lights")
    ring.fill((0, 40, 0))
    ring.set_pixel(0, (40, 0, 0))
    ring.show()

POC note: this is a stub. Running Jacdac sensors on the device/simulator needs
the Jacdac-enabled Python runtime (Task 1); until then these methods do nothing.
"""


class jacdac_led_ring:
    """A Jacdac LED ring.

    :param role: the role name used to bind this ring to a physical LED ring.
    """

    def __init__(self, role):
        self._role = role

    def set_pixel(self, index, color):
        """Set the colour of one LED.

        :param index: the LED to set, starting from 0.
        :param color: an (r, g, b) tuple, each value from 0 to 255.
        """

    def fill(self, color):
        """Set every LED to the same (r, g, b) colour."""

    def clear(self):
        """Turn every LED off."""

    def show(self):
        """Update the ring to show the colours you have set."""

    def set_brightness(self, value):
        """Set the overall brightness, from 0 (off) to 100 (full)."""
