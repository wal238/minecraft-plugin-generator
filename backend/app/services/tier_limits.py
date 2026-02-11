"""Subscription tier limits configuration."""

# builds_per_period: max builds per billing period (-1 = unlimited)
# max_queued: max concurrent queued jobs per user
# max_events / max_actions: block limits (-1 = unlimited)
# watermark: whether to inject watermark in generated code
TIER_LIMITS = {
    "free": {
        "builds_per_period": 1,
        "max_queued": 2,
        "max_events": 4,
        "max_actions": 8,
        "watermark": True,
    },
    "premium": {
        "builds_per_period": 5,
        "max_queued": 3,
        "max_events": 20,
        "max_actions": 50,
        "watermark": False,
    },
    "pro": {
        "builds_per_period": 20,
        "max_queued": 5,
        "max_events": -1,
        "max_actions": -1,
        "watermark": False,
    },
}
