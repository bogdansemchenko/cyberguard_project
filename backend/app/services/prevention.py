from sqlalchemy.orm import Session
from .. import models
from datetime import datetime

class PreventionSystem:
    def __init__(self, db: Session):
        self.db = db

    def block_ip(self, ip: str, reason: str):
        """Реальная логика блокировки (добавление в БД + имитация вызова Firewall)"""
        existing = self.db.query(models.Blacklist).filter_by(ip_address=ip).first()
        if not existing:
            new_block = models.Blacklist(ip_address=ip, reason=reason)
            self.db.add(new_block)
            self.db.commit()
            print(f"[FIREWALL] IP {ip} добавлен в правила блокировки iptables.")
            return True
        return False

    def isolate_host(self, host_id: str):
        print(f"[NETWORK] Хост {host_id} изолирован от VLAN.")
        # Здесь была бы логика взаимодействия с API свитча