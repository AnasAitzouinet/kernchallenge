from datetime import datetime

def format_datetime(dt: datetime) -> str:
    """
    Format a datetime object into a readable string.
    """
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def calculate_duration(start_time: datetime, end_time: datetime) -> float:
    """
    Calculate the duration between two datetime objects in hours.
    """
    duration = end_time - start_time
    return duration.total_seconds() / 3600