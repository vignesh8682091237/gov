from app import create_app

application = create_app()
app = application  # gunicorn entry point: wsgi:app

if __name__ == "__main__":
    application.run()
