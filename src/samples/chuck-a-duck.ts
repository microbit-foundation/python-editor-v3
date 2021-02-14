export default `from microbit import *
import radio
import random

radio.config(group=42)
players = 3
ID = 3
display.show(ID)
if ID == 1:
    hasDuck = True
else:
    hasDuck = False
radio.on()

while True:
    message = radio.receive()
    if accelerometer.was_gesture('shake'):
        if hasDuck:
            sendTo = random.randint(1, players)
            if sendTo != ID:
                display.clear()
                radio.send(str(sendTo))
    if message:
        if message == str(ID):
            hasDuck = True
            display.show(Image.DUCK)
        else:
            hasDuck = False`;
