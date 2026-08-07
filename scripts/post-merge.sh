#!/bin/bash
set -e
bash "$(dirname "$0")/ensure-dependencies.sh"
pnpm --filter @workspace/db run push
