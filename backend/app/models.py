from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True)
    type = Column(String)  # DDoS, SQLi, Malware
    severity = Column(String)  # Critical, High, Medium, Low
    status = Column(String)  # New, In Progress, Resolved, False Positive
    description = Column(String)
    source_ip = Column(String)
    responsible = Column(String, nullable=True)  # Кто взял в работу
    actions_taken = Column(JSON, default=[])  # Лог действий (блок, изоляция)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ThreatSignature(Base):
    """База сигнатур для анализа"""
    __tablename__ = "signatures"
    id = Column(Integer, primary_key=True)
    pattern = Column(String)  # Например "UNION SELECT"
    threat_type = Column(String)
    is_active = Column(Boolean, default=True)


class Blacklist(Base):
    """Подсистема предотвращения: заблокированные IP"""
    __tablename__ = "blacklist"
    id = Column(Integer, primary_key=True)
    ip_address = Column(String, unique=True)
    reason = Column(String)
    blocked_at = Column(DateTime(timezone=True), server_default=func.now())


class SystemStats(Base):
    __tablename__ = "stats"
    id = Column(Integer, primary_key=True)
    threat_level = Column(Integer, default=0)
    network_health = Column(Float, default=100.0)
    # Храним конфиг прямо в статах или отдельной таблице,
    # но для удобства тут свяжем текущее состояние с конфигом


class Settings(Base):
    """Глобальные настройки системы"""
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True)
    use_ml_analysis = Column(Boolean, default=True)
    use_signature_analysis = Column(Boolean, default=True)
    auto_block_critical = Column(Boolean, default=False)  # Автоблок
    notification_email = Column(String, default="admin@company.com")

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True)
    title = Column(String)
    type = Column(String)
    date_range = Column(String)
    status = Column(String)

class ProtectionSettings(Base):
    __tablename__ = "protection_settings"
    id = Column(Integer, primary_key=True)
    # Сохраняем все тумблеры как JSON, чтобы не плодить колонки
    config = Column(JSON)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String)
    role = Column(String)
    avatar = Column(String)