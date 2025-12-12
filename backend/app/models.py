from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, JSON
from sqlalchemy.sql import func
from .database import Base

# 1. Пользователи (Для профиля в меню)
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    role = Column(String)
    avatar = Column(String)

# 2. Угрозы (Для карты на фронтенде) - ЭТОГО НЕ ХВАТАЛО
class Threat(Base):
    __tablename__ = "threats"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)       # DDoS, Phishing...
    source_ip = Column(String)
    severity = Column(String)   # Critical, High...
    location_x = Column(Integer) # Координаты для карты (0-100)
    location_y = Column(Integer)
    is_active = Column(Boolean, default=True)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())

# 3. Инциденты (Журнал)
class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String)       # INC-4582
    type = Column(String)
    severity = Column(String)
    status = Column(String)
    description = Column(String)
    source = Column(String, nullable=True)
    responsible = Column(String, nullable=True)
    actions_taken = Column(JSON, default=[]) # Лог действий
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 4. Отчеты
class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    type = Column(String)
    status = Column(String)
    date_range = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 5. Настройки защиты (Тумблеры)
class ProtectionSettings(Base):
    __tablename__ = "protection_settings"
    id = Column(Integer, primary_key=True, index=True)
    config = Column(JSON) # Храним настройки как JSON

# 6. Статистика системы (Дашборд)
class SystemStats(Base):
    __tablename__ = "stats"
    id = Column(Integer, primary_key=True, index=True)
    threat_level = Column(Integer, default=0)
    network_health = Column(Float, default=100.0)

# --- SENIOR LOGIC MODELS (Для умной логики) ---

# 7. Сигнатуры (Для анализа)
class ThreatSignature(Base):
    __tablename__ = "signatures"
    id = Column(Integer, primary_key=True)
    pattern = Column(String)
    threat_type = Column(String)
    is_active = Column(Boolean, default=True)

# 8. Черный список (Для предотвращения)
class Blacklist(Base):
    __tablename__ = "blacklist"
    id = Column(Integer, primary_key=True)
    ip_address = Column(String, unique=True)
    reason = Column(String)
    blocked_at = Column(DateTime(timezone=True), server_default=func.now())