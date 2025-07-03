from datetime import datetime, timedelta

def days_until(date: datetime) -> int:
    delta = date - datetime.utcnow()
    return delta.days

def is_permit_expiring_soon(expiry_date: datetime, days_threshold=15) -> bool:
    return 0 <= days_until(expiry_date) <= days_threshold
