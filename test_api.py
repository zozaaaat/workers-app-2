import requests

print("Starting API tests...")

def test_create_employee():
    print("Starting test_create_employee...")

    # تسجيل الدخول للحصول على التوكن
    token_res = requests.post("http://127.0.0.1:8000/token", data={
        "username": "admin",
        "password": "admin123"
    })
    access_token = token_res.json().get("access_token")
    if not access_token:
        print("Login failed!")
        return

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    payload = {
        "full_name": "Test Employee",
        "email": "testemployee@example.com",
        "phone_number": "123456789",
        "position": "Tester",
        "department": "QA",
        "salary": 0,
        "start_date": "2024-01-01",
        "notes": "Test note"
    }

    res = requests.post("http://127.0.0.1:8000/employees/", json=payload, headers=headers)
    print(f"Create Employee Status Code: {res.status_code}")
    print("Create Employee Response:", res.text)

    if res.status_code in [200, 201]:  # اعتبر النجاح 200 أو 201
        print("Test passed: Employee created.")
    else:
        print("Test failed: Create employee failed:", res.text)

test_create_employee()
