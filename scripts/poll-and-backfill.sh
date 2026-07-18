#!/bin/bash
cd "/Users/sonalverma/Desktop/thecleansheet-web"
KEY=$(grep -oE "^GOOGLE_CSE_API_KEY=.*" .env.local | cut -d= -f2-)
CX=$(grep -oE "^GOOGLE_CSE_CX=.*" .env.local | cut -d= -f2-)
for i in $(seq 1 20); do
  OK=$(curl -s "https://www.googleapis.com/customsearch/v1?key=$KEY&cx=$CX&q=serum&searchType=image&num=1" --max-time 15 | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{const r=JSON.parse(d);console.log(r.error?"NO":"YES");}catch(e){console.log("NO");}})')
  echo "[$(date +%H:%M)] attempt $i: CSE=$OK"
  if [ "$OK" = "YES" ]; then
    echo ">>> CSE is live — running photo backfill"
    npx tsx scripts/backfill-images.ts
    echo ">>> BACKFILL COMPLETE"
    exit 0
  fi
  sleep 150
done
echo ">>> gave up after ~50 min — CSE still 403"
exit 1
