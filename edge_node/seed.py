# /edge_node/seed.py
import random
from database import SessionLocal
from models.ehr import LocalPatient, PatientCondition


def seed_database():
    db = SessionLocal()

    # 1. Wipe the database clean so we don't get duplicates on multiple runs
    print("🧹 Cleaning old database records...")
    db.query(PatientCondition).delete()
    db.query(LocalPatient).delete()
    db.commit()

    print("🌱 Planting massive enterprise-grade patient cohort...")

    # =========================================================
    # THE "GOLDEN COHORT" (Matches Trial: Female, >25, E11, No I50.1)
    # Expected Count for this strict criteria: 28
    # =========================================================
    golden_patients = []
    # Generate 28 golden patients with varying valid ages (26 to 85)
    for _ in range(28):
        golden_patients.append(
            LocalPatient(age=random.randint(26, 85), gender="Female")
        )

    db.add_all(golden_patients)
    db.commit()

    # Add E11 (Type 2 Diabetes) to all golden patients
    # Some also get benign secondary conditions to ensure the parser doesn't over-exclude
    for p in golden_patients:
        db.add(PatientCondition(patient_id=p.id, icd10_code="E11"))
        if random.choice([True, False]):
            db.add(
                PatientCondition(patient_id=p.id, icd10_code="J01.90")
            )  # Common cold (Benign)
    db.commit()

    # =========================================================
    # THE "DECOYS" (Complex Edge Cases to stress-test the AST Parser)
    # =========================================================
    decoys = []

    # Decoy Group 1: Has Diabetes, but is MALE (Should fail gender check) [Qty: 15]
    for _ in range(15):
        decoys.append(LocalPatient(age=random.randint(30, 70), gender="Male"))

    # Decoy Group 2: Female, Has Diabetes, but is TOO YOUNG (Age < 25) [Qty: 8]
    for _ in range(8):
        decoys.append(LocalPatient(age=random.randint(18, 24), gender="Female"))

    # Decoy Group 3: Female, >25, Has Diabetes, BUT HAS HEART FAILURE (I50.1)
    # (CRITICAL TEST: Must trigger the EXCLUSION logic) [Qty: 12]
    for _ in range(12):
        decoys.append(LocalPatient(age=random.randint(45, 80), gender="Female"))

    # Decoy Group 4: Female, >25, NO Diabetes. (Has other chronic issues like J45 Asthma) [Qty: 20]
    for _ in range(20):
        decoys.append(LocalPatient(age=random.randint(26, 65), gender="Female"))

    db.add_all(decoys)
    db.commit()

    # Assign conditions to Decoys

    # Assign E11 to Males
    for p in decoys[0:15]:
        db.add(PatientCondition(patient_id=p.id, icd10_code="E11"))

    # Assign E11 to Young Females
    for p in decoys[15:23]:
        db.add(PatientCondition(patient_id=p.id, icd10_code="E11"))

    # Assign E11 AND I50.1 to Older Females (Exclusion Test)
    for p in decoys[23:35]:
        db.add(PatientCondition(patient_id=p.id, icd10_code="E11"))
        db.add(
            PatientCondition(patient_id=p.id, icd10_code="I50.1")
        )  # The exclusionary condition

    # Assign random non-target conditions to the rest
    for p in decoys[35:55]:
        db.add(
            PatientCondition(
                patient_id=p.id, icd10_code=random.choice(["J45", "I10", "K21.9"])
            )
        )

    db.commit()

    # =========================================================
    # THE "BACKGROUND NOISE" (Random patients to fill the DB)
    # =========================================================
    background_patients = []
    # Add 50 completely random patients
    for _ in range(50):
        gender = random.choice(["Male", "Female"])
        age = random.randint(1, 99)
        background_patients.append(LocalPatient(age=age, gender=gender))

    db.add_all(background_patients)
    db.commit()

    # Assign random ICD-10 codes to background noise
    icd10_pool = [
        "A09",
        "B34.9",
        "C34.9",
        "E03.9",
        "F32.9",
        "G47.9",
        "H52.4",
        "L02.9",
        "M54.5",
        "S02.9",
    ]
    for p in background_patients:
        # Give each patient 1 to 3 random conditions
        num_conditions = random.randint(1, 3)
        conditions = random.sample(icd10_pool, num_conditions)
        for code in conditions:
            db.add(PatientCondition(patient_id=p.id, icd10_code=code))

    db.commit()

    print(f"✅ Successfully seeded {db.query(LocalPatient).count()} total patients!")
    print(
        f"✅ The strict 'Golden Cohort' size is exactly: {len(golden_patients)} patients."
    )
    print("📊 Breakdown:")
    print(f"   - Golden Targets: {len(golden_patients)}")
    print(f"   - Specific Decoys: {len(decoys)}")
    print(f"   - Background Noise: {len(background_patients)}")
    db.close()


if __name__ == "__main__":
    seed_database()
