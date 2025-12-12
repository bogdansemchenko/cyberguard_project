from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import io, asyncio, time, random
from datetime import datetime
from . import models, database

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


# --- Pydantic модели ---
class ReportCreateSchema(BaseModel):
    title: str
    type: str
    description: str


class SettingsUpdateSchema(BaseModel):
    config: dict


class NotifySchema(BaseModel):
    message: str


# --- СИМУЛЯТОР ЖИЗНИ ---
async def background_simulation():
    while True:
        await asyncio.sleep(10)
        db = database.SessionLocal()
        try:
            settings = db.query(models.ProtectionSettings).first()
            config = settings.config if settings and settings.config else {}
            auto_block = config.get("auto_block", False)

            if random.random() > 0.6:
                t = models.Threat(
                    type=random.choice(["DDoS", "Phishing", "Malware", "SQL-Inj"]),
                    source_ip=f"192.168.1.{random.randint(2, 200)}",
                    severity=random.choice(["Critical", "High", "Medium"]),
                    location_x=random.randint(10, 90),
                    location_y=random.randint(10, 90),
                    is_active=not auto_block
                )
                db.add(t)

                # Влияние на статистику
                stats = db.query(models.SystemStats).first()
                if stats:
                    stats.threat_level = min(100, stats.threat_level + 5)
                db.commit()
        except Exception as e:
            print(f"Simulation Error: {e}")
        finally:
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

    # SEEDING
    db = database.SessionLocal()
    if not db.query(models.User).first():
        db.add(models.User(username="Иван Иванов", role="Специалист по кибербезопасности",
                           avatar="https://i.pravatar.cc/150?img=11"))
        db.add(models.SystemStats(threat_level=75, network_health=99.2))

        incidents = [
            ("INC-4582", "DDoS-атака", "Critical", "Active", "Обнаружена распределенная атака.", "Александр Петров"),
            ("INC-4581", "Фишинг", "Medium", "Active", "Фишинговые письма в бухгалтерию.", "Мария Иванова")
        ]
        for code, t, sev, st, desc, resp in incidents:
            db.add(models.Incident(code=code, type=t, severity=sev, status=st, description=desc, responsible=resp))

        default_config = {
            "algo_ml": True, "algo_network": True,
            "auto_block": False, "isolate": True,
            "scan_interval": "Каждые 15 минут",
            "sensitivity": "Средняя",
            "notifications": "Email + Push"
        }
        db.add(models.ProtectionSettings(config=default_config))
        db.commit()
    db.close()


# ================= API ENDPOINTS =================

# 1. DASHBOARD: Данные
@app.get("/api/dashboard")
def dashboard(db: Session = Depends(get_db)):
    stats = db.query(models.SystemStats).first()
    if not stats: stats = models.SystemStats()
    active_threats = db.query(models.Threat).filter(models.Threat.is_active == True).count()
    incidents = db.query(models.Incident).limit(5).all()
    return {"stats": stats, "active_threats": active_threats, "incidents": incidents}


# 2. DASHBOARD: Кнопка "Запустить проверку" (БЫЛО ПРОПУЩЕНО)
@app.post("/api/scan/start")
def start_scan(db: Session = Depends(get_db)):
    time.sleep(2)  # Имитация работы
    # Находим случайную угрозу
    t = models.Threat(type="Spyware", source_ip="10.10.0.55", severity="Medium", location_x=50, location_y=50,
                      is_active=True)
    db.add(t)
    db.commit()
    return {"status": "scan_complete", "found": 1}


# 3. DASHBOARD: Кнопка "Блокировать угрозы" (БЫЛО ПРОПУЩЕНО)
@app.post("/api/threats/block_all")
def block_all_threats(db: Session = Depends(get_db)):
    db.query(models.Threat).filter(models.Threat.is_active == True).update({"is_active": False})
    stats = db.query(models.SystemStats).first()
    if stats:
        stats.threat_level = 0
        stats.network_health = 100.0
    db.commit()
    return {"status": "all_blocked"}


# 4. THREATS: Получение списка с фильтрами
@app.get("/api/threats")
def threats(type: str = Query(None), severity: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Threat)
    if type and type != "Все типы":
        query = query.filter(models.Threat.type == type)
    if severity and severity != "Все уровни":
        query = query.filter(models.Threat.severity == severity)
    return query.order_by(models.Threat.detected_at.desc()).all()


# 5. THREATS: Блокировка конкретного IP
@app.post("/api/actions/block_ip")
def block_ip(ip: str, db: Session = Depends(get_db)):
    db.query(models.Threat).filter(models.Threat.source_ip == ip).update({"is_active": False})
    db.commit()
    return {"status": "blocked"}


# 6. INCIDENTS: Список
@app.get("/api/incidents")
def incidents(db: Session = Depends(get_db)):
    return db.query(models.Incident).order_by(models.Incident.id.desc()).all()


# 7. INCIDENTS: Создание вручную
@app.post("/api/incidents/create")
def create_manual_incident(db: Session = Depends(get_db)):
    new_code = f"MANUAL-{random.randint(1000, 9999)}"
    inc = models.Incident(
        code=new_code, type="Подозрительная активность", severity="High", status="Active",
        description="Ручная регистрация инцидента оператором.", responsible="Администратор"
    )
    db.add(inc)
    db.commit()
    return {"status": "created"}


# 8. INCIDENTS: Действия (Блокировать / Взять в работу)
@app.post("/api/incidents/{id}/action")
def incident_action(id: int, action_type: str = Query(...), db: Session = Depends(get_db)):
    inc = db.query(models.Incident).filter(models.Incident.id == id).first()
    if inc:
        if action_type == "block_source":
            inc.status = "Resolved"
            inc.description += " [Источник заблокирован]"
        elif action_type == "assign":
            inc.status = "In Progress"
            inc.responsible = "Admin"
        db.commit()
    return {"status": "ok"}


# 9. INCIDENTS: Уведомления (БЫЛО ПРОПУЩЕНО)
@app.post("/api/notifications/send")
def send_notification(data: NotifySchema):
    print(f"SENDING NOTIFICATION: {data.message}")
    return {"status": "sent"}


# 10. ANALYSIS: Данные для графиков
@app.get("/api/analysis")
def analysis(db: Session = Depends(get_db)):
    heatmap = [{"name": d, "val": random.randint(20, 90)} for d in ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]]
    # Реальный подсчет типов
    counts = {}
    threats = db.query(models.Threat).all()
    for t in threats:
        counts[t.type] = counts.get(t.type, 0) + 1
    if not counts: counts = {"DDoS": 0, "Phishing": 0}

    return {"heatmap": heatmap, "attacks_by_type": counts}


# 11. REPORTS: Список
@app.get("/api/reports")
def reports(db: Session = Depends(get_db)):
    return db.query(models.Report).order_by(models.Report.id.desc()).all()


# 12. REPORTS: Создание (С данными)
@app.post("/api/reports/create")
def create_report(report_data: ReportCreateSchema, db: Session = Depends(get_db)):
    new_rep = models.Report(
        title=report_data.title,
        type=report_data.type,
        status="Готов",
        date_range=report_data.description
    )
    db.add(new_rep)
    db.commit()
    return new_rep


# 13. REPORTS: Экспорт файла
@app.get("/api/reports/{id}/export")
def export_report(id: int, format: str, db: Session = Depends(get_db)):
    rep = db.query(models.Report).filter(models.Report.id == id).first()
    content = f"REPORT #{id}\nTitle: {rep.title}\nDesc: {rep.date_range}\nFormat: {format}"
    return StreamingResponse(io.BytesIO(content.encode()), media_type="text/plain", headers={
        "Content-Disposition": f"attachment; filename=report_{id}.txt"
    })


# 14. PROTECTION: Получить настройки
@app.get("/api/protection")
def get_protection(db: Session = Depends(get_db)):
    settings = db.query(models.ProtectionSettings).first()
    if not settings:
        settings = models.ProtectionSettings(config={})
        db.add(settings)
        db.commit()
    return settings.config


# 15. PROTECTION: Обновить настройки
@app.post("/api/protection/update")
def update_protection(data: SettingsUpdateSchema, db: Session = Depends(get_db)):
    settings = db.query(models.ProtectionSettings).first()
    if not settings:
        settings = models.ProtectionSettings(config=data.config)
        db.add(settings)
    else:
        settings.config = data.config
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(settings, "config")
    db.commit()
    return {"status": "saved"}