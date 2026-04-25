# /edge_node/seed.py
from database import SessionLocal
from models.ehr import LocalPatient, PatientCondition


def seed_database():
    db = SessionLocal()

    # 1. Wipe the database clean so we don't get duplicates on multiple runs
    print("🧹 Cleaning old database records...")
    db.query(PatientCondition).delete()
    db.query(LocalPatient).delete()
    db.commit()

    print("🌱 Planting new enterprise-grade patient cohort...")

    # =========================================================
    # THE "GOLDEN COHORT" (Matches the Trial: Female, >25, E11, No I50.1)
    # We need at least 6 of these to bypass the K-Anonymity shield of 5.
    # =========================================================
    golden_patients = [
        LocalPatient(age=30, gender="Female"),
        LocalPatient(age=45, gender="Female"),
        LocalPatient(age=52, gender="Female"),
        LocalPatient(age=28, gender="Female"),
        LocalPatient(age=60, gender="Female"),
        LocalPatient(age=35, gender="Female"),
        LocalPatient(age=41, gender="Female"),
    ]
    db.add_all(golden_patients)
    db.commit()

    # Add E11 (Diabetes) to all golden patients
    for p in golden_patients:
        db.add(PatientCondition(patient_id=p.id, icd10_code="E11"))
    db.commit()

    # =========================================================
    # THE "DECOYS" (Close, but should be filtered out by AST Parser)
    # =========================================================
    decoys = [
        # Decoy 1: Has Diabetes, but is MALE
        LocalPatient(age=40, gender="Male"),
        # Decoy 2: Female, Has Diabetes, but is TOO YOUNG (Age 20)
        LocalPatient(age=20, gender="Female"),
        # Decoy 3: Female, >25, Has Diabetes, BUT HAS HEART FAILURE (I50.1) - MUST EXCLUDE!
        LocalPatient(age=55, gender="Female"),
        # Decoy 4: Female, >25, but NO Diabetes (Has Asthma instead 'J45')
        LocalPatient(age=33, gender="Female"),
    ]
    db.add_all(decoys)
    db.commit()

    # Add conditions to decoys
    db.add(PatientCondition(patient_id=decoys[0].id, icd10_code="E11"))  # Male Diabetes
    db.add(
        PatientCondition(patient_id=decoys[1].id, icd10_code="E11")
    )  # Young Diabetes

    db.add(
        PatientCondition(patient_id=decoys[2].id, icd10_code="E11")
    )  # Diabetes AND...
    db.add(
        PatientCondition(patient_id=decoys[2].id, icd10_code="I50.1")
    )  # Heart Failure! (Exclusion trigger)

    db.add(PatientCondition(patient_id=decoys[3].id, icd10_code="J45"))  # Asthma only

    db.commit()

    print(f"✅ Successfully seeded {db.query(LocalPatient).count()} total patients!")
    print(f"✅ The Golden Cohort size is: {len(golden_patients)} patients.")
    db.close()


if __name__ == "__main__":
    seed_database()
