from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class DocumentUploadRateThrottle(UserRateThrottle):
    """Rate limit for document uploads."""
    rate = '5/hour'  # 5 uploads per hour per user

class QueryRateThrottle(UserRateThrottle):
    """Rate limit for document queries."""
    rate = '60/minute'  # 60 queries per minute per user

class AnonQueryRateThrottle(AnonRateThrottle):
    """Rate limit for anonymous document queries."""
    rate = '10/minute'  # 10 queries per minute for anonymous users 