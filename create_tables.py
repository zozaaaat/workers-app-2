from database import engine, Base
import models  # عشان يسجل الموديلات مع Base

Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
