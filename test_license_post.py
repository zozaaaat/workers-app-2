import requests

url = "http://localhost:8000/licenses/"
data = {
    "name": "test",
    "civil_id": "123",
    "issuing_authority": "test",
    "license_type": "test",
    "status": "test",
    "issue_date": "2025-01-01",
    "expiry_date": "2025-12-31",
    "labor_count": 1,
    "license_number": "123",
    "address": "test",
    "company_id": 1
}
response = requests.post(url, json=data)
print(response.status_code)
print(response.text)
