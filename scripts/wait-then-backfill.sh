#!/bin/bash
cd "/Users/sonalverma/Desktop/thecleansheet-web"
BATCH_PID=$1
echo "[$(date +%H:%M)] waiting for batch PID $BATCH_PID to finish..."
while kill -0 "$BATCH_PID" 2>/dev/null; do sleep 60; done
echo "[$(date +%H:%M)] batch done — running image backfill for any product still missing a photo"
npx tsx scripts/backfill-images.ts
echo "[$(date +%H:%M)] ALL DONE — catalogue regenerated (r5) + images backfilled"
