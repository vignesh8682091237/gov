"""
Parses the standard, always-sent User-Agent HTTP header into a friendly
browser/OS/device-type summary. This is the same public header every web
server (and every website you visit) already receives on every request;
it is not a covert technique.
"""

from user_agents import parse as ua_parse


def parse_user_agent(ua_string: str):
    if not ua_string:
        return {"browser": None, "operating_system": None, "device_type": None}
    ua = ua_parse(ua_string)

    if ua.is_mobile:
        device_type = "mobile"
    elif ua.is_tablet:
        device_type = "tablet"
    elif ua.is_pc:
        device_type = "desktop"
    else:
        device_type = "other"

    browser = f"{ua.browser.family} {ua.browser.version_string}".strip()
    os_name = f"{ua.os.family} {ua.os.version_string}".strip()

    return {
        "browser": browser or None,
        "operating_system": os_name or None,
        "device_type": device_type,
    }
