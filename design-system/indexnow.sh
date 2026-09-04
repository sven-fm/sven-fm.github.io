#!/usr/bin/env bash
#
# sven.fm — IndexNow submission
#
# Tells Bing, Yandex, Seznam and Naver that a URL changed, instead of waiting
# days for the next crawl. Bing's index is what ChatGPT Search reads, so run
# this after any deploy that changes copy, the title or the meta description.
#
#   design-system/indexnow.sh                 # submit the home page
#   design-system/indexnow.sh / /work/advisor # submit specific paths
#
# 200 or 202 means accepted. 403 means the key file below is missing or no
# longer matches — it must stay reachable at KEY_LOCATION, it is the proof of
# ownership. 422 means the URL doesn't belong to the host.
#
# Google ignores IndexNow: request indexing in Search Console separately.

set -euo pipefail

HOST="sven.fm"
KEY="0996b186965c405784b2eae9b8e6b6fc"
KEY_LOCATION="https://${HOST}/${KEY}.txt"

paths=("${@:-/}")
status=0

for path in "${paths[@]}"; do
  url="https://${HOST}${path}"
  code=$(curl -s -o /dev/null -w "%{http_code}" --get \
    --data-urlencode "url=${url}" \
    --data-urlencode "key=${KEY}" \
    --data-urlencode "keyLocation=${KEY_LOCATION}" \
    "https://api.indexnow.org/indexnow")

  case "$code" in
    200|202) echo "ok   ${code}  ${url}" ;;
    403)     echo "fail ${code}  ${url} — key file not reachable at ${KEY_LOCATION}"; status=1 ;;
    422)     echo "fail ${code}  ${url} — URL does not match the host or key"; status=1 ;;
    429)     echo "fail ${code}  ${url} — rate limited, try again later"; status=1 ;;
    *)       echo "fail ${code}  ${url}"; status=1 ;;
  esac
done

exit $status
