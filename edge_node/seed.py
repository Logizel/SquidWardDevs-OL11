# /edge_node/seed.py
from database import SessionLocal
from models.ehr import LocalPatient, PatientCondition

def seed_database():
    db = SessionLocal()
    
    # Check if we already have data
    if db.query(LocalPatient).count() > 0:
        print("Database already seeded!")
        return

    # Create Dummy Patients
    p1 = LocalPatient(age=45, gender="Male")
    p2 = LocalPatient(age=30, gender="Female")
    p3 = LocalPatient(age=60, gender="Male")
    
    db.add_all([p1, p2, p3])
    db.commit()

    # Add ICD-10 Conditions (e.g., I50.1 is Heart Failure, E11 is Type 2 Diabetes)
    c1 = PatientCondition(patient_id=p1.id, icd10_code="I50.1")
    c2 = PatientCondition(patient_id=p1.id, icd10_code="E11")
    c3 = PatientCondition(patient_id=p2.id, icd10_code="E11")
    c4 = PatientCondition(patient_id=p3.id, icd10_code="I50.1")

    db.add_all([c1, c2, c3, c4])
    db.commit()
    
    print("Dummy patients and conditions seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
