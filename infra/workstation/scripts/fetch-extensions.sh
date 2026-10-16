#!/usr/bin/env bash
# Descarga las extensiones de extensions.txt desde Open VSX y las deja como extensiones "built-in"
# (carpeta de extensiones del IDE): sobreviven al disco persistente y el usuario no puede desinstalarlas.
set -euo pipefail
LIST="$1"; DEST="$2"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
while read -r id version platform _; do
  [[ -z "${id:-}" || "$id" == \#* ]] && continue
  pub="${id%%.*}"; name="${id#*.}"
  if [[ -n "${platform:-}" ]]; then
    url="https://open-vsx.org/api/$pub/$name/$platform/$version/file/$pub.$name-$version@$platform.vsix"
    folder="$id-$version-$platform"
  else
    url="https://open-vsx.org/api/$pub/$name/$version/file/$pub.$name-$version.vsix"
    folder="$id-$version"
  fi
  echo ">> $id $version ${platform:-universal}"
  curl -fsSL --retry 3 -o "$TMP/ext.vsix" "$url"
  rm -rf "$TMP/x" && mkdir "$TMP/x" && unzip -q "$TMP/ext.vsix" 'extension/*' -d "$TMP/x"
  rm -rf "$DEST/$folder" && mv "$TMP/x/extension" "$DEST/$folder"
done < "$LIST"
