#!/usr/bin/env python3
"""Safely backfill the attendee event_year attribute in a DynamoDB table.

The script makes no changes by default.  With --apply it only ever adds a
missing event_year, protected by a DynamoDB condition expression; it never
replaces an existing value or writes any other attendee attribute.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Iterable
from zoneinfo import ZoneInfo

LONDON = ZoneInfo("Europe/London")
YEAR_PATTERN = re.compile(r"\b(20\d{2})\b")

# These date ranges are deliberately explicit rather than inferred from a
# calendar year.  A pass description containing a year always takes priority.
# The 2026 range is open-ended because this is a backfill for the current data
# set; update this table before using the script for a later festival.
FALLBACK_RANGES = (
    (2024, datetime(2023, 11, 11, tzinfo=LONDON).date(), datetime(2024, 12, 1, tzinfo=LONDON).date()),
    (2025, datetime(2024, 12, 2, tzinfo=LONDON).date(), datetime(2025, 11, 30, tzinfo=LONDON).date()),
    (2026, datetime(2025, 12, 1, tzinfo=LONDON).date(), None),
)


class ClassificationError(ValueError):
    """An item cannot safely be assigned a single event year."""


@dataclass(frozen=True)
class PlanItem:
    key: dict[str, Any]
    event_year: str
    source: str


@dataclass(frozen=True)
class AwsConfig:
    region: str
    profile: str | None


def aws_json(config: AwsConfig, *arguments: str) -> dict[str, Any]:
    """Run the installed AWS CLI and return its JSON response."""
    command = ["aws", *arguments, "--region", config.region, "--output", "json"]
    if config.profile:
        command.extend(["--profile", config.profile])
    completed = subprocess.run(command, capture_output=True, text=True)
    if completed.returncode != 0:
        message = completed.stderr.strip() or completed.stdout.strip() or "AWS CLI command failed"
        raise RuntimeError(message)
    try:
        return json.loads(completed.stdout) if completed.stdout.strip() else {}
    except json.JSONDecodeError as error:
        raise RuntimeError(f"AWS CLI returned invalid JSON: {completed.stdout!r}") from error


def stable_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def key_id(item: dict[str, Any]) -> str:
    try:
        return stable_json({"email": item["email"], "ticket_number": item["ticket_number"]})
    except KeyError as error:
        raise ClassificationError(f"item is missing primary-key attribute {error.args[0]!r}") from error


def item_without_event_year(item: dict[str, Any]) -> str:
    copy = dict(item)
    copy.pop("event_year", None)
    return stable_json(copy)


def scalar_string(attribute: dict[str, Any] | None) -> str | None:
    if attribute is None:
        return None
    if set(attribute) != {"S"}:
        raise ClassificationError("event_year exists but is not a DynamoDB string")
    value = attribute["S"]
    if not YEAR_PATTERN.fullmatch(value):
        raise ClassificationError(f"event_year has invalid value {value!r}")
    return value


def line_item_years(item: dict[str, Any]) -> set[str]:
    raw_line_items = item.get("line_items")
    if raw_line_items is None:
        return set()
    if set(raw_line_items) != {"L"}:
        raise ClassificationError("line_items is not a DynamoDB list")

    years: set[str] = set()
    for raw_line_item in raw_line_items["L"]:
        if set(raw_line_item) != {"M"}:
            raise ClassificationError("line_items contains a non-map value")
        description = raw_line_item["M"].get("description")
        if description is None:
            continue
        if set(description) != {"S"}:
            raise ClassificationError("a line-item description is not a DynamoDB string")
        years.update(YEAR_PATTERN.findall(description["S"]))
    return years


def purchase_date(item: dict[str, Any]) -> datetime.date:
    raw_purchase_date = item.get("purchase_date")
    if raw_purchase_date is None or set(raw_purchase_date) not in ({"N"}, {"S"}):
        raise ClassificationError("purchase_date must be a DynamoDB number or a numeric string")

    attribute_type = next(iter(raw_purchase_date))
    raw_timestamp = raw_purchase_date[attribute_type]
    if attribute_type == "S" and (not isinstance(raw_timestamp, str) or not raw_timestamp.isdecimal()):
        raise ClassificationError(f"purchase_date string is not a Unix timestamp: {raw_timestamp!r}")

    try:
        timestamp = Decimal(raw_timestamp)
    except Exception as error:
        raise ClassificationError(f"invalid purchase_date {raw_purchase_date!r}") from error

    # Purchase dates are stored in seconds.  Treat milliseconds as an error
    # instead of silently guessing, because this script must be conservative.
    if timestamp < 0 or timestamp >= Decimal("100000000000") or timestamp != timestamp.to_integral_value():
        raise ClassificationError(f"purchase_date is not a whole Unix timestamp in seconds: {timestamp}")
    try:
        return datetime.fromtimestamp(int(timestamp), tz=timezone.utc).astimezone(LONDON).date()
    except (OverflowError, OSError, ValueError) as error:
        raise ClassificationError(f"purchase_date cannot be converted to a date: {timestamp}") from error


def fallback_event_year(item: dict[str, Any]) -> str:
    date = purchase_date(item)
    for year, start, end in FALLBACK_RANGES:
        if date >= start and (end is None or date <= end):
            return str(year)
    raise ClassificationError(f"purchase date {date.isoformat()} is outside the approved fallback ranges")


def determine_event_year(item: dict[str, Any]) -> tuple[str, str]:
    years = line_item_years(item)
    if len(years) > 1:
        raise ClassificationError(f"multiple years appear in line-item descriptions: {sorted(years)}")
    if years:
        return years.pop(), "line_item_description"
    return fallback_event_year(item), "purchase_date"


def scan_all(config: AwsConfig, table_name: str) -> dict[str, dict[str, Any]]:
    items: dict[str, dict[str, Any]] = {}
    start_key: dict[str, Any] | None = None
    page = 0

    while True:
        request = ["dynamodb", "scan", "--table-name", table_name, "--consistent-read"]
        if start_key:
            request.extend(["--exclusive-start-key", stable_json(start_key)])
        response = aws_json(config, *request)
        page += 1

        for item in response.get("Items", []):
            identifier = key_id(item)
            if identifier in items:
                raise RuntimeError(f"duplicate primary key returned while scanning: {identifier}")
            items[identifier] = item

        print(f"Scanned page {page}: {len(response.get('Items', []))} records", file=sys.stderr)
        start_key = response.get("LastEvaluatedKey")
        if not start_key:
            return items


def build_plan(items: Iterable[dict[str, Any]]) -> tuple[list[PlanItem], list[str], Counter[str]]:
    plan: list[PlanItem] = []
    problems: list[str] = []
    sources: Counter[str] = Counter()

    for item in items:
        identifier = key_id(item)
        try:
            inferred_year, source = determine_event_year(item)
            existing_year = scalar_string(item.get("event_year"))
            if existing_year is not None:
                if existing_year != inferred_year:
                    raise ClassificationError(
                        f"existing event_year {existing_year!r} conflicts with inferred {inferred_year!r} ({source})"
                    )
                sources["already_present"] += 1
                continue

            plan.append(
                PlanItem(
                    key={"email": item["email"], "ticket_number": item["ticket_number"]},
                    event_year=inferred_year,
                    source=source,
                )
            )
            sources[source] += 1
        except ClassificationError as error:
            problems.append(f"{identifier}: {error}")

    return plan, problems, sources


def apply_plan(config: AwsConfig, table_name: str, plan: list[PlanItem]) -> None:
    for number, entry in enumerate(plan, start=1):
        try:
            aws_json(
                config,
                "dynamodb",
                "update-item",
                "--table-name",
                table_name,
                "--key",
                stable_json(entry.key),
                "--update-expression",
                "SET event_year = :event_year",
                "--condition-expression",
                "attribute_not_exists(event_year)",
                "--expression-attribute-values",
                stable_json({":event_year": {"S": entry.event_year}}),
            )
        except RuntimeError as error:
            if "ConditionalCheckFailedException" in str(error):
                raise RuntimeError(
                    "aborting: an item changed after validation or already has event_year; "
                    "no existing event_year was overwritten"
                ) from error
            raise
        print(f"Updated {number}/{len(plan)}", file=sys.stderr)


def verify(before: dict[str, dict[str, Any]], after: dict[str, dict[str, Any]], plan: list[PlanItem]) -> list[str]:
    errors: list[str] = []
    before_keys = set(before)
    after_keys = set(after)
    if before_keys != after_keys:
        errors.append(
            f"table keys changed during the run: missing={len(before_keys - after_keys)}, added={len(after_keys - before_keys)}"
        )

    expected_updates = {stable_json(entry.key): entry.event_year for entry in plan}
    for identifier in sorted(before_keys & after_keys):
        before_item = before[identifier]
        after_item = after[identifier]
        if item_without_event_year(before_item) != item_without_event_year(after_item):
            errors.append(f"{identifier}: an attribute other than event_year changed")
            continue

        try:
            actual_year = scalar_string(after_item.get("event_year"))
            expected_year, _ = determine_event_year(after_item)
            if actual_year is None:
                errors.append(f"{identifier}: event_year is missing after the run")
            elif actual_year != expected_year:
                errors.append(f"{identifier}: event_year {actual_year!r} does not match inferred {expected_year!r}")
            elif identifier in expected_updates and actual_year != expected_updates[identifier]:
                errors.append(f"{identifier}: event_year was written as {actual_year!r}, expected {expected_updates[identifier]!r}")
        except ClassificationError as error:
            errors.append(f"{identifier}: cannot verify event_year: {error}")
    return errors


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--table", required=True, help="DynamoDB table to inspect (for example, dev-mlf-attendees)")
    parser.add_argument("--region", default="eu-west-1", help="AWS region (default: eu-west-1)")
    parser.add_argument("--profile", help="AWS named profile")
    parser.add_argument("--apply", action="store_true", help="Perform the conditional backfill; default is dry-run")
    parser.add_argument(
        "--confirm-table",
        help="Required with --apply and must exactly match --table, preventing an accidental target",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.apply and args.confirm_table != args.table:
        print("Refusing to apply: pass --confirm-table with exactly the same value as --table.", file=sys.stderr)
        return 2

    config = AwsConfig(region=args.region, profile=args.profile)

    try:
        aws_json(config, "dynamodb", "describe-table", "--table-name", args.table)
        before = scan_all(config, args.table)
        plan, problems, sources = build_plan(before.values())
    except RuntimeError as error:
        print(f"Preflight failed: {error}", file=sys.stderr)
        return 1

    print(f"Records scanned: {len(before)}")
    print(f"Already carrying event_year: {sources['already_present']}")
    print(f"Will derive from line-item description: {sources['line_item_description']}")
    print(f"Will derive from purchase date: {sources['purchase_date']}")

    if problems:
        print(f"\nRefusing to write: {len(problems)} records cannot be classified safely.", file=sys.stderr)
        for problem in problems:
            print(problem, file=sys.stderr)
        return 1

    if args.apply:
        try:
            apply_plan(config, args.table, plan)
        except RuntimeError as error:
            print(f"Backfill stopped: {error}", file=sys.stderr)
            return 1
    else:
        print("\nDry run only: no records were changed. Re-run with --apply and --confirm-table to write.")

    try:
        after = scan_all(config, args.table)
        verification_errors = verify(before, after, plan)
    except RuntimeError as error:
        print(f"Verification failed: {error}", file=sys.stderr)
        return 1

    if verification_errors:
        print(f"\nVerification failed: {len(verification_errors)} issue(s) found.", file=sys.stderr)
        for error in verification_errors:
            print(error, file=sys.stderr)
        return 1

    if args.apply:
        print(f"\nSuccess: added event_year to {len(plan)} records; verified {len(after)} records.")
    else:
        print(f"\nDry-run verification passed for {len(after)} records.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
