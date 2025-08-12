
import pandas as pd
import os
from datetime import datetime

def get_teacher_input():
    """Gets teacher data from user input."""
    teacher = {}
    print("\nEnter details for a new teacher (leave blank to skip a field):")
    
    teacher['name'] = input("Name: ")
    teacher['contact'] = input("Contact Phone: ")
    
    while True:
        salary_str = input("Salary (numeric): ")
        if not salary_str or salary_str.isdigit():
            teacher['salary'] = salary_str
            break
        else:
            print("Invalid input. Please enter a number for salary.")

    while True:
        date_str = input("Date Joined (YYYY-MM-DD): ")
        if not date_str:
            teacher['dateJoined'] = ""
            break
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
            teacher['dateJoined'] = date_str
            break
        except ValueError:
            print("Invalid date format. Please use YYYY-MM-DD.")
            
    teacher['subject'] = input("Subject: ")
    teacher['role'] = input("Role (e.g., Teacher, Head of Department): ")
    teacher['experience'] = input("Experience (e.g., 10 Years): ")
    teacher['department'] = input("Department (e.g., Science): ")
    teacher['qualification'] = input("Qualification (e.g., M.Sc. Physics): ")
    teacher['bio'] = input("Biography: ")
    teacher['imageUrl'] = input("Image URL: ")

    # Ensure required fields are not empty
    if not teacher['name'] or not teacher['subject']:
        print("\nName and Subject are required fields. This record will be skipped.")
        return None
        
    return teacher

def main():
    """Main function to run the script."""
    output_dir = "public"
    file_path = os.path.join(output_dir, "teachers.csv")
    
    # Ensure the output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Load existing data if the file exists
    if os.path.exists(file_path):
        print(f"Loading existing data from {file_path}")
        try:
            df = pd.read_csv(file_path)
            teachers_data = df.to_dict('records')
        except Exception as e:
            print(f"Could not read existing CSV file. Starting fresh. Error: {e}")
            teachers_data = []
    else:
        print("No existing teachers.csv found. A new file will be created.")
        teachers_data = []

    print("\n--- Add New Teachers ---")
    print("Press Ctrl+C to stop adding teachers at any time.")
    
    try:
        while True:
            teacher_record = get_teacher_input()
            if teacher_record:
                teachers_data.append(teacher_record)
                print("\nTeacher added successfully!")
            
            another = input("Add another teacher? (y/n): ").lower()
            if another != 'y':
                break
    except KeyboardInterrupt:
        print("\nExiting teacher entry.")

    if not teachers_data:
        print("No teacher data to save. Exiting.")
        return

    # Create a DataFrame
    df = pd.DataFrame(teachers_data)

    # Save to CSV
    df.to_csv(file_path, index=False)
    print(f"\nSuccessfully saved {len(df)} teachers to '{file_path}'")

if __name__ == "__main__":
    main()

