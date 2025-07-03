import requests

BASE_URL = "http://localhost:8000"

def test_get_companies():
    print("Start GET companies")
    response = requests.get(f"{BASE_URL}/companies/")
    print("GET /companies/ status:", response.status_code)
    print("Response:", response.json())

def test_create_company():
    print("Start POST company")
    data = {
        "file_number": "12345",
        "file_status": "Active",
        "cr_number": "CR-98765",
        "file_name": "شركة اختبار",
        "file_type": "نوع الملف",
        "file_category": "تصنيف",
        "management_area": "الإدارة",
        "legal_entity": "كيان قانوني",
        "ownership_type": "نوع الملكية"
    }
    response = requests.post(f"{BASE_URL}/companies/", json=data)
    print("POST /companies/ status:", response.status_code)
    print("Response:", response.json())
    return response.json().get("id")

def test_update_company(company_id):
    print("Start PUT company")
    data = {
        "file_status": "Inactive"
    }
    response = requests.put(f"{BASE_URL}/companies/{company_id}", json=data)
    print(f"PUT /companies/{company_id} status:", response.status_code)
    print("Response:", response.json())

def test_delete_company(company_id):
    print("Start DELETE company")
    response = requests.delete(f"{BASE_URL}/companies/{company_id}")
    print(f"DELETE /companies/{company_id} status:", response.status_code)

if __name__ == "__main__":
    print("Starting tests...")
    test_get_companies()
    new_id = test_create_company()
    if new_id:
        test_update_company(new_id)
        test_delete_company(new_id)
    print("Tests completed.")
