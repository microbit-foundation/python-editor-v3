# A simple ELIZA-style chatbot for the micro:bit.
# ELIZA (1966) pretends to be a therapist by turning what you say back
# into questions. It doesn't understand anything - it just spots keywords
# and swaps your words around ("I am" -> "you are").

from microbit import *
from microchat import *
import random

# Swap first/second person words so we can echo your sentence back.
reflections = {
    "i": "you", "me": "you", "my": "your", "mine": "yours",
    "am": "are", "i'm": "you're", "i've": "you've", "myself": "yourself",
    "you": "I", "your": "my", "yours": "mine", "you're": "I'm",
    "are": "am", "was": "were", "were": "was",
}


def reflect(text):
    words = text.split()
    for i in range(len(words)):
        words[i] = reflections.get(words[i], words[i])
    return " ".join(words)


# Rules matching the START of a sentence. {0} is the rest, reflected.
starts = (
    ("i need", ("Why do you need {0}?", "Would getting {0} really help?")),
    ("i am", ("How long have you been {0}?", "Why are you {0}?")),
    ("i'm", ("How long have you been {0}?", "Why are you {0}?")),
    ("i feel", ("Do you often feel {0}?", "Tell me more about feeling {0}.")),
    ("i think", ("Do you doubt {0}?", "Why do you think {0}?")),
    ("i want", ("What would it mean to get {0}?", "Why do you want {0}?")),
    ("i can't", ("Maybe you could {0} if you tried?", "What stops you?")),
    ("because", ("Is that the real reason?", "What else does that explain?")),
)

# Rules matching a keyword ANYWHERE in the sentence.
keywords = (
    (("hello", "hi", "hey"), ("Hi. What's on your mind?", "Hello. How are you?")),
    (("mother", "father", "mum", "dad", "family"),
        ("Tell me more about your family.", "How do you get on with them?")),
    (("friend", "friends"), ("Tell me about your friends.", "Why mention them?")),
    (("sorry",), ("No need to apologise.", "Apologies aren't necessary.")),
    (("yes",), ("You seem quite sure.", "I see. Go on.")),
    (("no",), ("Why not?", "Are you being a little negative?")),
    (("dream", "dreams"), ("What do your dreams suggest?", "Do you dream often?")),
    (("computer", "micro:bit", "robot"),
        ("Do machines worry you?", "Why do you mention machines?")),
)

fallbacks = (
    "Tell me more.", "Why do you say that?", "How does that make you feel?",
    "Go on...", "Can you put that another way?", "What makes you feel that way?",
)


def respond(said):
    low = said.strip().lower()
    if low == "":
        return "Please, say something."
    for start, replies in starts:
        if low.startswith(start + " "):
            rest = reflect(low[len(start):].strip().strip("?.!"))
            return random.choice(replies).format(rest)
    for words, replies in keywords:
        for word in words:
            if word in low:
                return random.choice(replies)
    return random.choice(fallbacks)


chat.start("Eliza")
display.show(Image.HAPPY)
chat.say("Hello, I'm Eliza. How are you feeling today?")
chat.say("(Say 'bye' when you want to stop.)")

while True:
    said = chat.ask()
    low = said.lower()
    # A little micro:bit personality: react on the LEDs.
    if "sad" in low or "unhappy" in low or "bad" in low:
        display.show(Image.SAD)
    elif "happy" in low or "good" in low or "great" in low:
        display.show(Image.HAPPY)
    if said.strip().lower() in ("bye", "goodbye", "quit", "exit"):
        chat.say("Goodbye. Take care of yourself.")
        break
    chat.say(respond(said))

chat.stop()
