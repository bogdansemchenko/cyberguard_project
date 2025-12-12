from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io

from . import models, database
from .services.analysis import AnalysisEngine
from .services.prevention import PreventionSystem
import asyncio, time, random
from datetime import datetime

app = FastAPI(title="CyberGuard Enterprise")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- СИМУЛЯТОР (Оставлен для живости системы) ---
async def background_simulation():
    while True:
        await asyncio.sleep(10)
        db = database.SessionLocal()
        # Если включена "Автоблокировка" в настройках, уровень угроз падает быстрее
        settings = db.query(models.ProtectionSettings).first()
        auto_block = settings.config.get("auto_block", False) if settings and settings.config else False

        if random.random() > 0.6:
            # Генерация угрозы
            t = models.Threat(
                type=random.choice(["DDoS", "Phishing", "Malware", "SQL-Inj"]),
                source_ip=f"192.168.1.{random.randint(2, 200)}",
                severity=random.choice(["Critical", "High", "Medium"]),
                location_x=random.randint(10, 90),
                location_y=random.randint(10, 90),
                is_active=not auto_block  # Если автоблок включен, угроза сразу гасится
            )
            db.add(t)

            # Обновление статов
            stats = db.query(models.SystemStats).first()
            if stats:
                stats.threat_level = min(100, stats.threat_level + (2 if not auto_block else 0))
                stats.network_health = max(0, stats.network_health - (1 if not auto_block else 0))
            db.commit()
        db.close()


@app.on_event("startup")
async def startup():
    for _ in range(15):
        try:
            models.Base.metadata.create_all(bind=database.engine)
            break
        except:
            time.sleep(2)

    asyncio.create_task(background_simulation())

    # SEEDING (Заполнение данными как на скринах)
    db = database.SessionLocal()
    if not db.query(models.User).first():
        db.add(models.User(username="Иван Иванов", role="Специалист по кибербезопасности",
                           avatar="https://i.pravatar.cc/150?img=11"))
        db.add(models.SystemStats(threat_level=75, network_health=99.2))

        # Инциденты (Точь-в-точь как на скрине)
        incidents = [
            ("INC-4582", "DDoS-атака", "Critical", "Active",
             "Обнаружена распределенная атака. Трафик превышает норму в 15 раз.", "Александр Петров"),
            ("INC-4581", "Фишинг", "Medium", "Active", "Фишинговые письма сотрудникам финансового отдела.",
             "Мария Иванова"),
            ("INC-4580", "SQL-инъекция", "High", "Resolved", "Попытка инъекции в модуль авторизации.", "Иван Иванов")
        ]
        for code, t, sev, st, desc, resp in incidents:
            db.add(models.Incident(code=code, type=t, severity=sev, status=st, description=desc, responsible=resp))

        # Отчеты
        db.add(models.Report(title="Ежедневный отчет за 22.11.2025", type="Сводный", status="Готов"))
        db.add(models.Report(title="Еженедельный отчет безопасности", type="Аналитический", status="Готов"))

        # Настройки защиты по умолчанию
        default_config = {
            "algo_ml": True, "algo_network": True, "algo_user": False,
            "auto_block": True, "isolate": True, "restart": False,
            "siem": True, "backup": False
        }
        db.add(models.ProtectionSettings(config=default_config))
        db.commit()
    db.close()


# --- API ---

@app.get("/api/dashboard")
def dashboard(db: Session = Depends(get_db)):
    stats = db.query(models.SystemStats).first()
    active_threats = db.query(models.Threat).filter(models.Threat.is_active == True).count()
    incidents = db.query(models.Incident).limit(5).all()
    return {"stats": stats, "active_threats": active_threats, "incidents": incidents}


@app.get("/api/threats")
def threats(db: Session = Depends(get_db)):
    return db.query(models.Threat).order_by(models.Threat.detected_at.desc()).all()


@app.post("/api/threats/block_all")
def block_all_threats(db: Session = Depends(get_db)):
    db.query(models.Threat).update({models.Threat.is_active: False})
    stats = db.query(models.SystemStats).first()
    stats.threat_level = 0
    stats.network_health = 100.0
    db.commit()
    return {"status": "ok"}


@app.get("/api/incidents")
def incidents(db: Session = Depends(get_db)):
    return db.query(models.Incident).order_by(models.Incident.id.desc()).all()


@app.post("/api/incidents/{id}/action")
def incident_action(id: int, action: str, db: Session = Depends(get_db)):
    inc = db.query(models.Incident).filter(models.Incident.id == id).first()
    if action == "block_source":
        inc.status = "Resolved"
        inc.description += " [Источник заблокирован]"
    elif action == "assign":
        inc.description += " [Назначена проверка]"
    elif action == "notify":
        pass  # Имитация отправки email
    db.commit()
    return {"status": "ok"}


@app.get("/api/analysis")
def analysis():
    # Мок-данные для графиков
    return {
        "heatmap": [random.randint(10, 100) for _ in range(7)],
        "attacks_by_type": {"DDoS": 45, "Phishing": 20, "Malware": 15, "Other": 20}
    }


@app.get("/api/reports")
def reports(db: Session = Depends(get_db)):
    return db.query(models.Report).all()


@app.post("/api/reports/create")
def create_report(db: Session = Depends(get_db)):
    new_rep = models.Report(title=f"Отчет от {datetime.now().strftime('%d.%m.%Y')}", type="По запросу",
                            status="В обработке")
    db.add(new_rep)
    db.commit()
    return new_rep


@app.get("/api/protection")
def get_protection(db: Session = Depends(get_db)):
    return db.query(models.ProtectionSettings).first().config


@app.post("/api/protection/update")
def update_protection(config: dict, db: Session = Depends(get_db)):
    settings = db.query(models.ProtectionSettings).first()
    settings.config = config
    db.commit()
    return {"status": "saved"}


@app.post("/api/incidents/create")
def create_manual_incident(db: Session = Depends(get_db)):
    """Создает тестовый инцидент вручную по кнопке"""
    # Генерируем случайный код и тип для имитации ввода данных
    new_code = f"MANUAL-{random.randint(1000, 9999)}"

    inc = models.Incident(
        code=new_code,
        type="Подозрительная активность",
        severity="High",
        status="Active",
        description="Ручная регистрация подозрительной активности оператором.",
        responsible="Иван Иванов",
        source="Внутренняя сеть"
    )
    db.add(inc)
    db.commit()
    return {"status": "created", "incident": new_code}


@app.post("/api/scan/start")
def start_scan(db: Session = Depends(get_db)):
    # Имитация бурной деятельности: находим "скрытую" угрозу
    time.sleep(2)
    new_threat = models.Threat(
        type="Spyware",
        source_ip=f"10.0.0.{random.randint(50, 99)}",
        severity="Medium",
        location_x=random.randint(20, 80), location_y=random.randint(20, 80),
        is_active=True
    )
    db.add(new_threat)
    db.commit()
    return {"status": "scan_complete", "found": 1}



@app.get("/api/threats")
def get_threats(
        type: str = Query(None),
        severity: str = Query(None),
        db: Session = Depends(get_db)
):
    query = db.query(models.Threat)
    # Если фильтры выбраны - применяем их
    if type and type != "Все типы":
        query = query.filter(models.Threat.type == type)
    if severity and severity != "Все уровни":
        query = query.filter(models.Threat.severity == severity)

    return query.order_by(models.Threat.detected_at.desc()).all()


@app.post("/api/notifications/send")
def send_notification(email: str = "staff@company.com", message: str = "Alert"):
    # Здесь была бы интеграция с SMTP
    print(f"EMAIL SENT TO {email}: {message}")
    return {"status": "sent"}




@app.get("/api/reports/{id}/export")
def export_report(id: int, format: str):
    # Генерация фейкового файла
    file_content = f"Report ID {id}\nFormat: {format}\nStatus: Secure".encode()
    return StreamingResponse(io.BytesIO(file_content), media_type="text/plain", headers={
        "Content-Disposition": f"attachment; filename=report_{id}.{format.lower()}"
    })