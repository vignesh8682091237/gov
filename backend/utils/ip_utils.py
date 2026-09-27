from flask import request


def get_client_ip() -> str:
    """
    Best-effort real client IP, honoring a trusted reverse proxy's
    X-Forwarded-For header (first hop only, to reduce spoofing risk).
    In production, only trust this header when Flask sits behind a
    known/controlled proxy (nginx/traefik) that overwrites it correctly.
    """
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"
