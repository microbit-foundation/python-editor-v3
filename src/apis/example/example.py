import foo
import foo as notFoo
from bar import *
from blort import blortA

if True:
  moduleVar = "foo"

def exampleFunction(paramA):
  exampleLocal = 1
  def add_stuff(x):
    class ExampleNestedClass:
      pass
    x + paramA + exampleLocal
  answer = [addStuff(x) for x in [1, 2, 3]]
  return answer

class ExampleSuperClass:
  def hello(self, name):
    print("Hello " + name);

class ExampleClass(ExampleSuperClass):
  classA = "foo"
  instanceA = "classValue"
  def __init__(self, paramA, paramB):
    self.instanceA = paramA
    self.instanceB = paramA
  def goodbye(self):
    print("Goodbye")

instance = ExampleClass("a", "b")
instance.hello("Dave")
instance.goodbye()
print(ExampleClass.instanceA)
print(instance.instanceA)

# Other complications staticmethod, classmethod, global, nonlocal.
