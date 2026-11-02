import re


EVENT_YEAR_PATTERN = re.compile(r"^20\d{2}$")
EVENT_YEAR_IN_DESCRIPTION_PATTERN = re.compile(r"\b(20\d{2})\b")


def resolve_event_year(line_items, supplied_event_year=None, default_event_year=None):
    """Return one safe event year, preferring an explicit caller value.

    Ticket descriptions are the normal source of truth.  The configured
    sales-cycle value is the final fallback, keeping every new ticket
    indexable when a caller omits or supplies unusable event-year information.
    """
    if supplied_event_year is not None:
        supplied_event_year = str(supplied_event_year)
        if EVENT_YEAR_PATTERN.fullmatch(supplied_event_year):
            return supplied_event_year

    years = set()
    for line_item in line_items or []:
        if isinstance(line_item, dict) and isinstance(line_item.get("description"), str):
            years.update(EVENT_YEAR_IN_DESCRIPTION_PATTERN.findall(line_item["description"]))

    if len(years) == 1:
        return years.pop()

    if default_event_year is not None:
        default_event_year = str(default_event_year)
        if EVENT_YEAR_PATTERN.fullmatch(default_event_year):
            return default_event_year

    return None
