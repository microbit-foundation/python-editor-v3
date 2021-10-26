import { Toolkit } from "./ToolkitDocumentation/model";

export const microbitToolkit: Toolkit = {
  name: "micro:bit toolkit",
  description: "Control your micro:bit with these helpful examples",
  contents: [
    {
      name: "LED display",
      description: "Use the micro:bit LEDs for text and images",
      contents: [
        {
          name: "Words and numbers",
          text: "You can scroll words and numbers on the micro:bit's LED display:",
          code: "display.scroll('score')\ndisplay.scroll(23)",
        },
      ],
    },
  ],
};

export const pythonToolkit: Toolkit = {
  name: "Python toolkit",
  description: "Learn the Python language using these helpful examples",
  contents: [
    {
      name: "Functions",
      description:
        "Functions let you re-use the same set of instructions many times in a program. They can perform a complex task, or add new functionality to your code and make it easier to read and modify. You define your function near the start of your program, giving it a name, then call it using its name.",
      contents: [
        {
          name: "Procedures",
          text: "Procedures, also called sub-routines, are functions that perform a fixed set of instructions.\nThis function called heartbeat animates a heart on the LED display when you press button A:",
          code: `def heartbeat():
    display.show(Image.HEART_SMALL)
    sleep(500)
    display.show(Image.HEART)
    sleep(500)
    display.clear()

while True:
    if button_a.was_pressed():
        heartbeat()`,
        },
        {
          name: "Functions with parameters",
          text: "You can pass parameters to functions. In this example, the animation runs once if you press button A, three times if you press button B:",
          code: `def heartbeat(h):
    for x in range(h):
        display.show(Image.HEART_SMALL)
        sleep(500)
        display.show(Image.HEART)
        sleep(500)
        display.clear()

while True:
    if button_a.was_pressed():
        heartbeat(1)
    if button_b.was_pressed():
        heartbeat(3)`,
          furtherText:
            "Note that because we used a function, we only need one set of code to display the animation.",
        },
      ],
    },
    {
      name: "Loops",
      description: "See Loops",
      contents: [],
    },
  ],
};
