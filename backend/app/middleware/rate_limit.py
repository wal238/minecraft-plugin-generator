"""Rate limiting middleware using slowapi."""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Rate limiter instance — keyed by remote IP address.
# Individual route decorators use @limiter.limit("N/period") to set limits.
limiter = Limiter(key_func=get_remote_address)
