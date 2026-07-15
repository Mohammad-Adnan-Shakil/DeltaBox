import logging

logger = logging.getLogger(__name__)


def analyze(year, grand_prix, session_type, driver1, driver2):
    logger.warning("telemetry_openf1 stub called — OpenF1 telemetry is handled by the backend directly")
    return {"error": "Telemetry analysis is not available in the ML service. Use the backend /telemetry endpoint instead."}
