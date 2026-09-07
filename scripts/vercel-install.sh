#!/usr/bin/env bash
set -euo pipefail

# Vercel does not include Pixi. Install the same version as CI locally.
export PIXI_HOME="$PWD/.vercel/pixi"
export PIXI_VERSION="v0.76.2"
export PIXI_NO_PATH_UPDATE=1
curl --fail --silent --show-error --location https://pixi.sh/install.sh -o /tmp/shou-pixi-install.sh
bash /tmp/shou-pixi-install.sh
"$PIXI_HOME/bin/pixi" run --locked install
