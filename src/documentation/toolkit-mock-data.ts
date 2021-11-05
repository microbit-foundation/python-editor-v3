/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Toolkit } from "./ToolkitDocumentation/model";

export const microbitToolkit: Toolkit = {
  name: "micro:bit toolkit",
  description: "Mock content for demo purposes.",
  contents: [
    {
      name: "Display",
      description: "Use the micro:bit LEDs for text and images",
      contents: [
        {
          name: "Scroll",
          contents: [
            {
              _type: "text",
              value:
                "You can scroll words and numbers on the micro:bit’s LED display:",
            },
            {
              _type: "code",
              value:
                "from microbit import *\n\ndisplay.scroll('score')\ndisplay.scroll(23)",
            },
            {
              _type: "text",
              detail: true,
              value:
                "Using extra parameters you can control the speed of the scrolling, whether it loops, and if it waits for the scrolling to stop before executing the next instruction.",
            },
            {
              _type: "text",
              detail: true,
              value: "Any delay less than 150ms will be faster than normal.",
            },
            {
              _type: "text",
              detail: true,
              value:
                "This code will keep scrolling the word ‘score’ faster than normal in a loop, and play music at the same time:",
            },
            {
              _type: "code",
              detail: true,
              value: `
from microbit import *
import music
display.scroll('score', delay=100, loop=True, wait=False) 
music.play(music.ODE)
`,
            },
          ],
        },
        {
          name: "Show",
          contents: [
            {
              _type: "text",
              value:
                "You can show words and numbers on the LED display one character at a time:",
            },
            {
              _type: "code",
              value:
                "from microbit import *\n\ndisplay.show('score')\ndisplay.show(23)",
            },
            {
              _type: "text",
              detail: true,
              value:
                "You can use the `delay`, `loop` and `wait` options with display.show.",
            },
            {
              _type: "text",
              detail: true,
              value:
                "Any delay below 400ms will be faster than normal, anything above 400ms slower than normal.",
            },
            {
              _type: "text",
              detail: true,
              value:
                "This example will keep showing a countdown in a loop with 1 second between each number and will not wait before executing the next instruction:",
            },
            {
              _type: "code",
              detail: true,
              value: `from microbit import *
display.show(9876543210, delay=1000, loop=True, wait=False)`,
            },
          ],
        },
        {
          name: "Images: built-in",
          contents: [
            {
              _type: "text",
              value:
                "The micro:bit has lots of built-in pictures that you can show on the display.",
            },
            {
              _type: "code",
              select: {
                prompt: "Show example for:",
                placeholder: "@IMAGE@",
                options: [
                  "Image.HEART",
                  "Image.HEART_SMALL",
                  "Image.HAPPY",
                  "Image.SMILE",
                  "Image.SAD",
                  "Image.CONFUSED",
                  "Image.ANGRY",
                  "Image.ASLEEP",
                  "Image.SURPRISED",
                  "Image.SILLY",
                  "Image.FABULOUS",
                  "Image.MEH",
                  "Image.YES",
                  "Image.NO",
                ],
              },
              value: "from microbit import *\n\ndisplay.show(@IMAGE@)",
            },
            {
              _type: "text",
              value:
                "There are lots more images to choose from. Use the dropdown above to try different images.",
            },
            {
              _type: "text",
              detail: true,
              value:
                "For the full list of built-in images, look here [NO LINK YET]",
            },
          ],
        },
        {
          name: "Images: make your own",
          contents: [
            {
              _type: "text",
              value:
                "You can make your own pictures like this. Use numbers between 0 and 9. 0 means the LED is off, 9 is the brightest. Can you guess what this will show?",
            },
            {
              _type: "code",
              value: `from microbit import *

display.show(Image('00300:'
  '03630:'
  '36963:'
  '03630:'
  '00300'))      
`,
            },
          ],
        },
        {
          name: "Clear the display",
          contents: [
            {
              _type: "text",
              value: "Clear the display, turning all the LEDs off:",
            },
            {
              _type: "code",
              value: "from microbit import *\ndisplay.clear()",
            },
          ],
        },
        {
          name: "Set pixels",
          contents: [
            {
              _type: "text",
              value:
                "You can light up individual pixels. Each pixel has a co-ordinate starting at the top left with 0,0. Use numbers 0 to 9 to select how bright you want each pixel to be, with 9 being the brightest. This will light the top left LED as bright as it can go:",
            },
            {
              _type: "code",
              value: "from microbit import *\ndisplay.set_pixel(0,0,9)",
            },
            {
              _type: "text",
              detail: true,
              value:
                "You can light up individual pixels. Each pixel has a co-ordinate starting at the top left with 0,0. Use numbers 0 to 9 to select how bright you want each pixel to be, with 9 being the brightest. This will light the top left LED as bright as it can go:",
            },
            {
              _type: "code",
              detail: true,
              value: `from microbit import *

for y in range(5):
for x in range(5):
    display.set_pixel(x,y,9)
    sleep(50)
`,
            },
            {
              _type: "text",
              detail: true,
              value: "Note that this uses a nested loop, a loop inside a loop.",
            },
          ],
        },
      ],
    },
  ],
};

export const pythonToolkit: Toolkit = {
  name: "Python toolkit",
  description: "Mock content for demo purposes",
  contents: [
    {
      name: "Loops",
      description: "Repeat a block of code",
      introduction:
        "Loops repeat sections of code. They are useful to make programs more compact, easier to read and help us control the flow of a set of instructions. Using loops is also called ‘iteration’.",
      contents: [
        {
          name: "While loops",
          contents: [
            {
              _type: "text",
              value:
                "While loops keep a block of code running as long as something is true. Any instructions after the while statement that are indented are included in the loop.",
            },
            {
              _type: "code",
              value:
                "from microbit import *\nwhile True:\n    display.scroll('micro:bit')",
            },
            {
              _type: "text",
              detail: true,
              value:
                "This is a common way to have a ‘main loop’ in your program that repeats forever and allows you to continuously check and act on things like the button states or sensor readings.",
            },
          ],
        },
        {
          name: "Control loops",
          contents: [
            {
              _type: "text",
              value:
                "You can use while loops to control when code is run. This will show < on the LED display when you tilt your micro:bit left, show > when you tilt it right, otherwise it clears the display.",
            },
            {
              _type: "code",
              value: `
from microbit import *
while True:
    while accelerometer.is_gesture('left'):
        display.show('<')
    while accelerometer.is_gesture('right'):
        display.show('>')
    display.clear()`,
            },
          ],
        },
        {
          name: "Numbered for loops",
          contents: [
            {
              _type: "text",
              value:
                "You can use for loops to count. Although this code shows 9 numbers, it starts at 0, so you will see numbers from 0 to 8 on the LED display:",
            },
            {
              _type: "code",
              value: `
                for n in range(9):
                    display.show(n)
                    sleep(1000)`,
            },
          ],
        },
      ],
    },
    {
      name: "Functions",
      description:
        "Functions let you re-use the same set of instructions many times in a program. They can perform a complex task, or add new functionality to your code and make it easier to read and modify. You define your function near the start of your program, giving it a name, then call it using its name.",
      contents: [
        {
          name: "Procedures",
          contents: [
            {
              _type: "text",
              value:
                "Procedures, also called sub-routines, are functions that perform a fixed set of instructions.\nThis function called heartbeat animates a heart on the LED display when you press button A:",
            },
            {
              _type: "code",
              value: `from microbit import *\n\ndef heartbeat():
    display.show(Image.HEART_SMALL)
    sleep(500)
    display.show(Image.HEART)
    sleep(500)
    display.clear()
    
while True:
    if button_a.was_pressed():
        heartbeat()`,
            },
          ],
        },
        {
          name: "Functions with parameters",
          contents: [
            {
              _type: "text",
              value:
                "You can pass parameters to functions. In this example, the animation runs once if you press button A, three times if you press button B:",
            },
            {
              _type: "code",
              value: `from microbit import *\n\ndef heartbeat(h):
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
            },
            {
              _type: "text",
              value:
                "Note that because we used a function, we only need one set of code to display the animation.",
            },
          ],
        },
      ],
    },
  ],
};
