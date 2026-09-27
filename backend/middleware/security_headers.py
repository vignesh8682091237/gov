def apply_security_headers(response):
    """Sets defensive HTTP headers on every response (belt-and-braces
    alongside Flask-Talisman, which handles HSTS/CSP when FORCE_HTTPS)."""
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy",
                                 "geolocation=(), camera=(), microphone=()")
    return response
