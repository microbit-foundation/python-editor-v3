#!/usr/bin/env python3
# (c) 2026, Micro:bit Educational Foundation and contributors
# SPDX-License-Identifier: MIT
"""Build pinned, offline editor type data. Never imports or executes driver code."""
import ast
import base64
import hashlib
import json
from pathlib import Path
import re
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'src/language-server/circuitpython'
INPUTS = {
    'circuitpython_stubs-10.3.0-py3-none-any.whl': ('https://files.pythonhosted.org/packages/23/63/9b3f360683f3af97a1331a57e4c75865f3c491af12902edc1c60b2c3d215/circuitpython_stubs-10.3.0-py3-none-any.whl', 'ca877a877508b466af3d6f1090528ebe0330592e850f28d09707f952844e1ddd'),
    'sensebox-stub-source.zip': ('https://github.com/adafruit/Adafruit_CircuitPython_Bundle/releases/download/20261016/adafruit-circuitpython-bundle-py-20261016.zip', '9ce340d9d64ef05d10c7828096a883245715874ab4adb1ab3eb454e2794555b4'),
    'adafruit_circuitpython_typing-1.13.0-py3-none-any.whl': ('https://files.pythonhosted.org/packages/ea/36/405f36287611e587b3077e5f6f2d4f73fedac6d710907ceeec61abdc7c42/adafruit_circuitpython_typing-1.13.0-py3-none-any.whl', '6bfb25ae818a81d569a0048a179815f5944b846edf8f3a2043a84622d8610434'),
    'circuitpython-stubs-LICENSE.txt': ('https://raw.githubusercontent.com/adafruit/circuitpython/10.3.0/LICENSE', 'f8d44b948113cff390f6454e59069139a92da75227a7b50bb3589499d4b5fe1b'),
}


def stub_body(body):
    result = []
    for node in body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            node.body = ([node.body[0]] if node.body and isinstance(node.body[0], ast.Expr) and isinstance(node.body[0].value, ast.Constant) and isinstance(node.body[0].value.value, str) else []) + [ast.Expr(ast.Constant(Ellipsis))]
            # Bare return annotations in upstream drivers stay unknown rather
            # than inventing a sensor value type.
            result.append(node)
        elif isinstance(node, ast.ClassDef):
            attributes = {}
            for child in node.body:
                if isinstance(child, ast.FunctionDef) and child.name == '__init__':
                    args = {arg.arg: arg.annotation or ast.Name('Any') for arg in child.args.args + child.args.kwonlyargs}
                    for assignment in ast.walk(child):
                        if isinstance(assignment, ast.Assign):
                            for target in assignment.targets:
                                if isinstance(target, ast.Attribute) and isinstance(target.value, ast.Name) and target.value.id == 'self' and not target.attr.startswith('_'):
                                    value = assignment.value
                                    annotation = args.get(value.id, ast.Name('Any')) if isinstance(value, ast.Name) else ast.Name(type(value.value).__name__) if isinstance(value, ast.Constant) and type(value.value) in (int, float, str, bool) else ast.Name('Any')
                                    attributes[target.attr] = ast.AnnAssign(ast.Name(target.attr, ast.Store()), annotation, None, 1)
            node.body = stub_body(node.body)
            existing = {child.name for child in node.body if isinstance(child, (ast.FunctionDef, ast.ClassDef))}
            node.body += [value for name, value in attributes.items() if name not in existing]
            if not node.body: node.body = [ast.Expr(ast.Constant(Ellipsis))]
            result.append(node)
        elif isinstance(node, (ast.Import, ast.ImportFrom, ast.Assign, ast.AnnAssign)):
            result.append(node)
        elif isinstance(node, ast.Expr) and isinstance(node.value, ast.Constant) and isinstance(node.value.value, str):
            result.append(node)
        elif isinstance(node, (ast.If, ast.Try)):
            result += stub_body(node.body)
            # TYPE_CHECKING imports are needed by the virtual language server.
            # Except/fallback imports must not override the real types.
    return result


def make_stub(source):
    tree = ast.parse(source)
    tree.body = stub_body(tree.body)
    # Future imports must remain at the beginning of a stub.
    futures = [node for node in tree.body if isinstance(node, ast.ImportFrom) and node.module == '__future__']
    doc = tree.body[:1] if tree.body and isinstance(tree.body[0], ast.Expr) and isinstance(tree.body[0].value, ast.Constant) and isinstance(tree.body[0].value.value, str) else []
    tree.body = doc + futures + [ast.ImportFrom('typing', [ast.alias('Any')], 0)] + [node for node in tree.body if node not in futures and node not in doc]
    header = '\n'.join(line for line in source.splitlines()[:60] if line.startswith('#') and ('SPDX-' in line or 'Copyright' in line))
    return header + '\n' + ast.unparse(ast.fix_missing_locations(tree)) + '\n'


def main():
    cache = Path('/tmp')
    for name, (url, checksum) in INPUTS.items():
        path = cache / name
        if not path.exists(): path.write_bytes(urllib.request.urlopen(url, timeout=60).read())
        if hashlib.sha256(path.read_bytes()).hexdigest() != checksum: raise ValueError('Invalid input: ' + name)
    files = {}
    def put(name, source):
        files['/typeshed/stdlib/' + name] = source
    with zipfile.ZipFile(cache / 'circuitpython_stubs-10.3.0-py3-none-any.whl') as archive:
        for name in sorted(archive.namelist()):
            if '-stubs/' in name and name.endswith('.pyi'):
                put(name.replace('-stubs/', '/'), archive.read(name).decode())
        put('board/__init__.pyi', archive.read('board_definitions/sensebox_mcu_esp32s2/__init__.pyi').decode())
    board_source = files['/typeshed/stdlib/board/__init__.pyi']
    pins = sorted(set(re.findall(r'GPIO(\d+)', board_source)) | {'42', '45'}, key=int)
    put('microcontroller/pin.pyi', '# Generated senseBox MCU-S2 pin references.\nfrom microcontroller import Pin\n' + ''.join(f'GPIO{pin}: Pin\n' for pin in pins))
    files['/typeshed/stdlib/microcontroller/__init__.pyi'] += '\nfrom . import pin as pin\n'
    catalog = json.loads((ROOT / 'src/device/libraries/catalog.json').read_text())
    # Public driver surfaces for the sensors/modules shipped in the sidebar.
    selected = set(['adafruit_bme680', 'adafruit_icm20x', 'adafruit_veml6070', 'adafruit_dps310', 'adafruit_ssd1306', 'adafruit_ntp', 'neopixel', 'adafruit_pixel_framebuf', 'hdc1080', 'vl53lxcx'])
    def dependencies(name):
        for child in catalog['modules'][name]['dependencies']:
            if child not in selected:
                selected.add(child)
                dependencies(child)
    for name in list(selected): dependencies(name)
    notices = {}
    with zipfile.ZipFile(cache / 'sensebox-stub-source.zip') as archive:
        prefix = 'adafruit-circuitpython-bundle-py-20261016/lib/'
        for path in sorted(archive.namelist()):
            if not path.startswith(prefix) or not path.endswith('.py'): continue
            relative = path[len(prefix):]
            if relative.split('/')[0].removesuffix('.py') not in selected: continue
            source = archive.read(path).decode()
            put(relative[:-3] + '.pyi', make_stub(source))
            notices[relative] = {'version': catalog['modules'][relative.split('/')[0].removesuffix('.py')]['version'], 'source': INPUTS['sensebox-stub-source.zip'][0], 'headers': [line for line in source.splitlines()[:60] if line.startswith('#') and ('SPDX-' in line or 'Copyright' in line)]}
    for name in ['hdc1080', 'vl53lxcx']:
        payload_bytes = (ROOT / 'public' / catalog['assetRoot'] / (name + '.json')).read_bytes()
        if hashlib.sha256(payload_bytes).hexdigest() != catalog['modules'][name]['sha256']: raise ValueError('Invalid library payload: ' + name)
        payload = json.loads(payload_bytes)
        for file in payload['files']:
            if file['path'].endswith('.py'):
                source = base64.b64decode(file['data']).decode()
                relative = file['path'].removeprefix('lib/')
                put(relative[:-3] + '.pyi', make_stub(source))
                notices[relative] = {'version':catalog['modules'][name]['version'], 'source':'Bundled, hash-verified library payload', 'headers':[line for line in source.splitlines()[:60] if 'SPDX-' in line]}
    with zipfile.ZipFile(cache / 'adafruit_circuitpython_typing-1.13.0-py3-none-any.whl') as archive:
        for path in archive.namelist():
            if path.startswith('circuitpython_typing/') and path.endswith('.py'): put(path[:-3] + '.pyi', make_stub(archive.read(path).decode()))
        (OUT / 'TYPING-LICENSE.txt').write_bytes(archive.read('adafruit_circuitpython_typing-1.13.0.dist-info/licenses/LICENSE'))
    # Small, reviewed overrides for unannotated senseBox driver properties.
    for path in (OUT / 'overrides').rglob('*.pyi'):
        put(path.relative_to(OUT / 'overrides').as_posix(), path.read_text())
    # Keep the complete common Python builtins; CircuitPython's builtins stub
    # only describes its additions and would otherwise hide int, str, etc.
    files.pop('/typeshed/stdlib/builtins/__init__.pyi', None)
    (OUT / 'typeshed.json').write_text(json.dumps({'files':dict(sorted(files.items())), 'libraryModules': sorted(selected | {'circuitpython_typing'})},ensure_ascii=False,separators=(',', ':'))+'\n')
    (OUT / 'LICENSE.txt').write_bytes((cache/'circuitpython-stubs-LICENSE.txt').read_bytes())
    (OUT / 'NOTICES.json').write_text(json.dumps({'inputs': INPUTS, 'libraries': notices, 'board':'sensebox_mcu_esp32s2', 'firmware':'10.3.0'},indent=2,ensure_ascii=False)+'\n')
    print('Prepared',len(files),'type files for',len(selected),'libraries')

if __name__ == '__main__': main()
