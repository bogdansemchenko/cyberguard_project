import random
from sqlalchemy.orm import Session
from .. import models

class AnalysisEngine:
    def __init__(self, db: Session):
        self.db = db
        self.settings = db.query(models.Settings).first()

    def analyze_traffic(self, log_data: dict):
        """
        Главный метод анализа. Принимает сырые данные, возвращает вердикт.
        Реализует п. 3.2 ТЗ (Анализ данных)
        """
        detected_threat = None
        severity = "Low"

        # 1. Сигнатурный анализ (Поиск паттернов)
        if self.settings.use_signature_analysis:
            signatures = self.db.query(models.ThreatSignature).filter_by(is_active=True).all()
            for sig in signatures:
                if sig.pattern in log_data.get("payload", ""):
                    detected_threat = sig.threat_type
                    severity = "High"
                    break

        # 2. ML Анализ (Эвристика/Аномалии) - Симуляция вероятности
        if not detected_threat and self.settings.use_ml_analysis:
            # Если запросов слишком много с одного IP -> DDoS
            if log_data.get("request_rate", 0) > 100:
                detected_threat = "DDoS"
                severity = "Critical"
            # Случайная эвристика для демонстрации
            elif random.random() > 0.95:
                detected_threat = "Zero-Day Exploit"
                severity = "Critical"

        return detected_threat, severity