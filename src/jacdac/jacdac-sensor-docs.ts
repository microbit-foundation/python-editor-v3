/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { JacdacSearchableContent } from "../documentation/search/common";

/**
 * The Jacdac sidebar top-level topics (the sections shown in JacdacArea).
 */
export interface JacdacTopic {
  id: string;
  name: string;
  description: string;
}

export const jacdacTopics: JacdacTopic[] = [
  {
    id: "config",
    name: "Config",
    description: "Assign role names to your Jacdac sensors and identify them",
  },
  {
    id: "live-device",
    name: "Live device",
    description: "See the roles currently assigned on the connected micro:bit",
  },
  { id: "button", name: "Button", description: "A pressable button" },
  {
    id: "rotary-encoder",
    name: "Rotary encoder",
    description: "A rotary encoder you can turn (often with a button too)",
  },
  { id: "slider", name: "Slider", description: "A linear potentiometer slider" },
  {
    id: "led-ring",
    name: "LED ring",
    description: "A ring of colour LEDs you can light up (an output)",
  },
  {
    id: "servo",
    name: "Servo",
    description: "A servo motor you can move to an angle (an output)",
  },
];

/**
 * Per-method example snippets for the Jacdac sidebar sensor sections. Hardcoded,
 * English-only content. Each `code` is a complete, draggable example (with
 * imports); CodeEmbed hides `from microbit import *` in the preview but inserts
 * the full snippet on drag/drop.
 */
export interface MethodExample {
  /** Method signature shown as a heading, e.g. "was_pressed()". */
  method: string;
  description: string;
  code: string;
}

export const sensorMethodExamples: Record<string, MethodExample[]> = {
  button: [
    {
      method: "is_pressed()",
      description: "Check whether the button is being held right now.",
      code: `from microbit import *
from jacdac_button import jacdac_button

my_button = jacdac_button("my role name")
while True:
    if my_button.is_pressed():
        display.show(Image.HEART)
    else:
        display.clear()`,
    },
    {
      method: "was_pressed()",
      description: "React once each time the button is pressed.",
      code: `from microbit import *
from jacdac_button import jacdac_button

my_button = jacdac_button("my role name")
count = 0
while True:
    if my_button.was_pressed():
        count += 1
        display.show(str(count))`,
    },
    {
      method: "get_presses()",
      description: "Count how many presses happened over a period of time.",
      code: `from microbit import *
from jacdac_button import jacdac_button

my_button = jacdac_button("my role name")
while True:
    sleep(2000)
    display.scroll(my_button.get_presses())`,
    },
    {
      method: "pressure()",
      description: "Read how hard the button is pressed, from 0 to 100.",
      code: `from microbit import *
from jacdac_button import jacdac_button

my_button = jacdac_button("my role name")
while True:
    display.show(str(my_button.pressure()))`,
    },
  ],
  "rotary-encoder": [
    {
      method: "value()",
      description: "Read the position as a click count (may be negative).",
      code: `from microbit import *
from jacdac_rotary_encoder import jacdac_rotary_encoder

my_dial = jacdac_rotary_encoder("my role name")
while True:
    display.scroll(my_dial.value())`,
    },
    {
      method: "clicks_per_turn()",
      description: "Find how many clicks make one full turn.",
      code: `from microbit import *
from jacdac_rotary_encoder import jacdac_rotary_encoder

my_dial = jacdac_rotary_encoder("my role name")
display.scroll(my_dial.clicks_per_turn())`,
    },
  ],
  slider: [
    {
      method: "value()",
      description: "Read the slider position, from 0 to 100.",
      code: `from microbit import *
from jacdac_slider import jacdac_slider

my_slider = jacdac_slider("my role name")
while True:
    display.show(str(my_slider.value()))`,
    },
  ],
  "led-ring": [
    {
      method: "fill()",
      description: "Set every LED to the same colour. Colours are (red, green, blue).",
      code: `from microbit import *
from jacdac_led_ring import jacdac_led_ring

my_ring = jacdac_led_ring("my role name")
my_ring.fill((0, 40, 0))
my_ring.show()`,
    },
    {
      method: "set_pixel()",
      description: "Set one LED's colour by its position, starting from 0.",
      code: `from microbit import *
from jacdac_led_ring import jacdac_led_ring

my_ring = jacdac_led_ring("my role name")
my_ring.set_pixel(0, (40, 0, 0))
my_ring.set_pixel(1, (0, 0, 40))
my_ring.show()`,
    },
    {
      method: "clear()",
      description: "Turn every LED off.",
      code: `from microbit import *
from jacdac_led_ring import jacdac_led_ring

my_ring = jacdac_led_ring("my role name")
my_ring.fill((40, 40, 0))
my_ring.show()
sleep(1000)
my_ring.clear()
my_ring.show()`,
    },
    {
      method: "set_brightness()",
      description: "Set the overall brightness, from 0 (off) to 100 (full).",
      code: `from microbit import *
from jacdac_led_ring import jacdac_led_ring

my_ring = jacdac_led_ring("my role name")
my_ring.set_brightness(30)
my_ring.fill((40, 0, 40))
my_ring.show()`,
    },
  ],
  servo: [
    {
      method: "set_angle()",
      description: "Move the servo arm to an angle, from 0 to 180 degrees.",
      code: `from microbit import *
from jacdac_servo import jacdac_servo

my_servo = jacdac_servo("my role name")
while True:
    my_servo.set_angle(0)
    sleep(1000)
    my_servo.set_angle(180)
    sleep(1000)`,
    },
    {
      method: "off()",
      description: "Turn the servo off so it stops holding its position.",
      code: `from microbit import *
from jacdac_servo import jacdac_servo

my_servo = jacdac_servo("my role name")
my_servo.set_angle(90)
sleep(1000)
my_servo.off()`,
    },
  ],
};

/**
 * Searchable content for the Jacdac sidebar: one document per topic (search
 * results navigate to the topic). Method names/descriptions are folded into the
 * sensor topics' content so searching e.g. "was_pressed" finds the Button
 * section.
 */
export const jacdacSearchableContent = (): JacdacSearchableContent[] =>
  jacdacTopics.map((topic) => {
    const methods = sensorMethodExamples[topic.id] ?? [];
    const methodText = methods
      .map((m) => `${m.method} ${m.description}`)
      .join(" ");
    return {
      id: topic.id,
      title: topic.name,
      containerTitle: "Jacdac",
      content: [topic.description, methodText].filter(Boolean).join(" "),
    };
  });
