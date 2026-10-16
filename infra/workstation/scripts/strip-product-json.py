#!/usr/bin/env python3
"""Quita de product.json del IDE la galeria de extensiones y las claves de chat/IA."""
import json
import sys

path = sys.argv[1] if len(sys.argv) > 1 else "/opt/code-oss/product.json"
data = json.load(open(path))
removed = [k for k in list(data)
           if k == "extensionsGallery" or any(w in k.lower() for w in ("chat", "gemini", "copilot"))]
for k in removed:
    data.pop(k)
json.dump(data, open(path, "w"), indent=2)
print("product.json: claves removidas ->", removed)
assert "extensionsGallery" not in data
