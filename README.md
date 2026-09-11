# NGO Full-Stack Starter

A small full-stack foundation for an NGO platform:

- `backend/`: Django + Django REST Framework API
- `frontend/`: React + Vite client
- `core/`: first Django domain app, with a `Project` model and CRUD endpoints

## Run locally

### Backend

```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
py manage.py migrate
py manage.py runserver
```

The API runs at `http://127.0.0.1:8000`.

### Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## API routes

- `GET /api/health/` checks service availability
- `GET|POST /api/projects/` lists or creates projects
- `GET|PUT|PATCH|DELETE /api/projects/<id>/` manages one project
- `/admin/` is available for Django administration after creating a superuser

## Structure

```text
ngo_fullstack_starter/
├── backend/
│   ├── config/       # Django project settings and server entry points
│   ├── core/         # Domain models, serializers, views, and API routes
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/          # React UI and API client
│   ├── package.json
│   └── .env.example
└── README.md
```

For deployment, replace the development secret in `backend/.env`, set `DJANGO_DEBUG=False`, and provide production hosts and database settings through environment variables.
