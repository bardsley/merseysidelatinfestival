#!/usr/bin/env bash

set -euo pipefail

AWS_REGION="eu-west-1"
AWS_PROFILE_ARG="${AWS_PROFILE:-}"
SOURCE_TABLE="prod-mlf-attendees"
TARGET_TABLE="dev-mlf-attendees"
MAX_RETRIES=8

usage() {
  cat <<EOF
Usage: $0 [--region <aws-region>] [--profile <aws-profile>]

Copies all records from:
  ${SOURCE_TABLE}
to:
  ${TARGET_TABLE}

The target is not cleared. Matching records are overwritten; dev-only
records remain in the target table.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
  --profile)
    [ -n "${2:-}" ] || {
      echo "Error: --profile requires a value" >&2
      exit 1
    }
    AWS_PROFILE_ARG="$2"
    shift 2
    ;;
  --region)
    [ -n "${2:-}" ] || {
      echo "Error: --region requires a value" >&2
      exit 1
    }
    AWS_REGION="$2"
    shift 2
    ;;
  --help | -h)
    usage
    exit 0
    ;;
  *)
    echo "Error: unknown option '$1'" >&2
    usage >&2
    exit 1
    ;;
  esac
done

AWS_ARGS=(--region "$AWS_REGION")

if [ -n "$AWS_PROFILE_ARG" ]; then
  AWS_ARGS+=(--profile "$AWS_PROFILE_ARG")
fi

WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/mlf-attendees-migrate.XXXXXX")"
trap 'rm -rf "$WORK_DIR"' EXIT

# Fail early if either table cannot be accessed.
aws dynamodb describe-table \
  "${AWS_ARGS[@]}" \
  --table-name "$SOURCE_TABLE" \
  --output json >/dev/null

aws dynamodb describe-table \
  "${AWS_ARGS[@]}" \
  --table-name "$TARGET_TABLE" \
  --output json >/dev/null

write_batch() {
  local items_json="$1"
  local payload_file="$WORK_DIR/batch-payload.json"
  local response
  local unprocessed
  local pending
  local attempt=1

  # BatchWriteItem requires each item to be wrapped in PutRequest/Item.
  jq -cn \
    --arg table "$TARGET_TABLE" \
    --argjson items "$items_json" \
    '{($table): [$items[] | {PutRequest: {Item: .}}]}' >"$payload_file"

  while true; do
    response="$(
      aws dynamodb batch-write-item \
        "${AWS_ARGS[@]}" \
        --request-items "file://${payload_file}" \
        --output json
    )"

    unprocessed="$(
      jq -c \
        --arg table "$TARGET_TABLE" \
        '.UnprocessedItems[$table] // []' <<<"$response"
    )"

    pending="$(jq 'length' <<<"$unprocessed")"

    if [ "$pending" -eq 0 ]; then
      return 0
    fi

    if [ "$attempt" -ge "$MAX_RETRIES" ]; then
      echo "Error: ${pending} records remained unprocessed after ${MAX_RETRIES} attempts." >&2
      return 1
    fi

    echo "Retrying ${pending} unprocessed records (attempt ${attempt}/${MAX_RETRIES})..."

    # UnprocessedItems already has PutRequest wrappers, so retain them.
    jq -cn \
      --arg table "$TARGET_TABLE" \
      --argjson requests "$unprocessed" \
      '{($table): $requests}' >"$payload_file"

    sleep "$attempt"
    attempt=$((attempt + 1))
  done
}

start_key=""
page=0
total_written=0

while true; do
  if [ -n "$start_key" ]; then
    scan_response="$(
      aws dynamodb scan \
        "${AWS_ARGS[@]}" \
        --table-name "$SOURCE_TABLE" \
        --exclusive-start-key "$start_key" \
        --output json
    )"
  else
    scan_response="$(
      aws dynamodb scan \
        "${AWS_ARGS[@]}" \
        --table-name "$SOURCE_TABLE" \
        --output json
    )"
  fi

  items="$(jq -c '.Items' <<<"$scan_response")"
  item_count="$(jq 'length' <<<"$items")"
  page=$((page + 1))

  echo "Read page ${page}: ${item_count} records"

  for ((offset = 0; offset < item_count; offset += 25)); do
    batch="$(jq -c ".[$offset:$((offset + 25))]" <<<"$items")"
    batch_count="$(jq 'length' <<<"$batch")"

    write_batch "$batch"

    total_written=$((total_written + batch_count))
    echo "Written ${total_written} records so far"
  done

  start_key="$(jq -c '.LastEvaluatedKey // empty' <<<"$scan_response")"

  if [ -z "$start_key" ]; then
    break
  fi
done

echo "Migration complete: ${total_written} records copied from ${SOURCE_TABLE} to ${TARGET_TABLE}."
