.PHONY: test data bundle api web demo

test:
	$$env:PYTHONPATH="backend"; python -m pytest backend/tests/

data:
	$$env:PYTHONPATH="backend"; python backend/aurumlens/data/backfill.py

bundle:
	$$env:PYTHONPATH="backend"; python backend/aurumlens/replay/snapshots.py

api:
	python -m uvicorn aurumlens.api.main:app --host 0.0.0.0 --port 8000 --app-dir backend

web:
	cd web && npm run dev

demo:
	python -m uvicorn aurumlens.api.main:app --port 8000 --app-dir backend &
	cd web && npm run dev
