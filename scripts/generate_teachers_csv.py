
import pandas as pd
from faker import Faker
import random
from datetime import datetime
import os

# Initialize Faker
fake = Faker()

# Configuration
NUM_TEACHERS = 100
DEPARTMENTS = {
    "Science": ["Physics", "Chemistry", "Biology"],
    "Mathematics": ["Mathematics"],
    "Humanities": ["History", "Geography", "Civics"],
    "Languages": ["English", "Urdu", "French"],
    "Commerce": ["Accounting", "Business Studies", "Economics"],
    "Arts": ["Music", "Fine Arts", "Drama"]
}
ROLES = ["Teacher", "Senior Teacher", "Head of Department", "Coordinator"]
QUALIFICATIONS = ["B.Ed", "M.Sc.", "M.A.", "Ph.D.", "M.Phil"]

# --- Teacher Data Generation ---
def create_teacher(teacher_id):
    name = fake.name()
    department = random.choice(list(DEPARTMENTS.keys()))
    subject = random.choice(DEPARTMENTS[department])
    experience_years = random.randint(1, 25)
    experience = f"{experience_years} Years"
    date_joined = fake.date_between(start_date=f"-{experience_years}y", end_date="today").strftime("%Y-%m-%d")
    
    bio_templates = [
        f"A passionate educator specializing in {subject} with over {experience_years} years of experience.",
        f"Dedicated to fostering a love for {subject} in students through interactive and engaging teaching methods.",
        f"An expert in {department}, committed to academic excellence and student development.",
        f"Brings a wealth of knowledge in {subject} to the classroom, inspiring the next generation of learners."
    ]

    return {
        "name": name,
        "contact": fake.phone_number(),
        "salary": random.randint(40000, 90000),
        "dateJoined": date_joined,
        "subject": subject,
        "role": random.choice(ROLES),
        "experience": experience,
        "department": department,
        "qualification": f"{random.choice(QUALIFICATIONS)} in {subject}",
        "bio": random.choice(bio_templates),
        "imageUrl": f"https://i.pravatar.cc/400?u={teacher_id}"
    }

# --- Main Script ---
def main():
    print("Generating teacher data...")
    teachers_data = [create_teacher(i) for i in range(NUM_TEACHERS)]

    # Create a DataFrame
    df = pd.DataFrame(teachers_data)

    # Define the output path
    output_dir = "public"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    file_path = os.path.join(output_dir, "teachers.csv")

    # Save to CSV
    df.to_csv(file_path, index=False)
    print(f"Successfully generated {NUM_TEACHERS} teachers and saved to '{file_path}'")

if __name__ == "__main__":
    main()
