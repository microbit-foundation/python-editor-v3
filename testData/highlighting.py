a = 1
b = 2

if a > b:
    print("these")
elif a == b:
    print("examples")
else:
    print("demonstrate code structure highlighting")

if a > b: pass

if a > b:
    if True:
        pass

while True:
    try:
        if True:
          pass # Intentionally misindented
    except:
        pass

class Pair:
    def __init__(self, a, b):
        self.a = a
        self.b = b
        if True:
            if True:
                if True:
                    pass

    def swap(self):
        return Pair(self.b, self.a)

def exchange(p1, p2):
    return [Pair(p1.a, p2.b), Pair(p2.a, p1.b)]