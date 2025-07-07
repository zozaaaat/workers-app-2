import requests

url = "http://localhost:8000/auth/login"
data = {
    "username": "admin",
    "password": "admin123"
}
headers = {"Content-Type": "application/x-www-form-urlencoded"}

response = requests.post(url, data=data, headers=headers)

print("Status Code:", response.status_code)
print("Response:", response.text)
