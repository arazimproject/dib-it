import json
import os

import firebase_admin
import firebase_admin.firestore


def migrate(data: dict):
    result = {}

    if "Semester" in data:
        semester = data.pop("Semester")
        result["semester"] = semester
    if "Courses" in data:
        data[f"Courses {semester}"] = data.pop("Courses")
    if "Groups" in data:
        data[f"Groups {semester}"] = data.pop("Groups")
    if "Colors" in data:
        data[f"Colors {semester}"] = data.pop("Colors")
    if "Taken Courses (Dib It Serialize)" in data:
        data.pop("Taken Courses (Dib It Serialize)")
    if "School (Dib It Serialize)" in data:
        result["school"] = data["School (Dib It Serialize)"]
    if "Study Plan (Dib It Serialize)" in data:
        result["studyPlan"] = data["Study Plan (Dib It Serialize)"]

    keys = sorted(data.keys())
    for key in keys:
        if key.startswith("Courses"):
            semester = key.split(" ")[1]
            courses = data[key]
            groups_key = f"Groups {semester}"
            groups = {}
            if groups_key in data:
                groups = data[groups_key]
            colors_key = f"Colors {semester}"
            colors = {}
            if colors_key in data:
                colors = data[colors_key]

            if "courses" not in result:
                result["courses"] = {}

            if semester not in result["courses"]:
                result["courses"][semester] = []

            for course in courses:
                course_dict = {"id": course}
                result["courses"][semester].append(course_dict)
                if course in groups:
                    course_dict["groups"] = groups[course]
                if course in colors:
                    course_dict["color"] = colors[course]

    return result


if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    credential = firebase_admin.credentials.Certificate("credentials.json")
    app = firebase_admin.initialize_app(
        credential,
    )
    firestore = firebase_admin.firestore.client()

    users = firestore.collection("users")
    data = {}
    for document in users.get():
        data[document.reference.path] = document.to_dict()
    with open("backup.json", "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    # document = firestore.document("users/mhkpK3j4ILawzPCOx5FJrbuwSRI3")
    # print(document.get().to_dict())

    # document.set(migrate(document.get().to_dict()))
