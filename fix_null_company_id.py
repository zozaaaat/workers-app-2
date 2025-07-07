from app.database import engine
from app.models import Worker
from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=engine)
session = Session()

# تحديث جميع العمال الذين لديهم company_id = None ليصبح 1
updated = session.query(Worker).filter((Worker.company_id == None)).update({Worker.company_id: 1})
session.commit()
print(f"تم تحديث {updated} عامل ليكون لديهم company_id=1.")
session.close()
