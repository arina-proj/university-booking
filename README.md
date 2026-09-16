# Booking App

## Запуск проекта

### 1. Клонировать репозиторий

```bash
git clone https://github.com/arina-proj/university-booking
cd university-booking
```

### 2. Запустить проект

```bash
docker compose up --build
```

После запуска приложение будет доступно по адресу:

```text
http://localhost:8080
```

### Остановка проекта

```bash
docker compose down
```

### Полный сброс вместе с базой данных

```bash
docker compose down -v
```
