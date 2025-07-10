"""
سكريبت اختبار APIs
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_api_endpoint(endpoint, method="GET", data=None):
    """اختبار endpoint معين"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        
        print(f"\n🔍 اختبار {method} {endpoint}")
        print(f"الحالة: {response.status_code}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                if isinstance(result, list):
                    print(f"النتيجة: قائمة بـ {len(result)} عنصر")
                    if len(result) > 0:
                        print(f"أول عنصر: {result[0]}")
                else:
                    print(f"النتيجة: {result}")
                return True
            except:
                print(f"النتيجة: {response.text[:200]}...")
                return True
        else:
            print(f"خطأ: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ خطأ في الاتصال: {e}")
        return False

def test_all_endpoints():
    """اختبار جميع ال endpoints"""
    
    endpoints = [
        "/workers",
        "/companies", 
        "/leaves",
        "/absences",
        "/violations",
        "/deductions",
        "/licenses",
        "/notifications"
    ]
    
    print("🚀 بدء اختبار APIs...")
    print("=" * 50)
    
    results = {}
    
    for endpoint in endpoints:
        success = test_api_endpoint(endpoint)
        results[endpoint] = "✅" if success else "❌"
    
    print("\n" + "=" * 50)
    print("📊 ملخص النتائج:")
    print("=" * 50)
    
    for endpoint, status in results.items():
        print(f"{status} {endpoint}")
    
    # إحصائيات
    successful = sum(1 for status in results.values() if status == "✅")
    total = len(results)
    
    print(f"\n📈 النجح: {successful}/{total} ({successful/total*100:.1f}%)")
    
    if successful == total:
        print("🎉 جميع الـ APIs تعمل بنجاح!")
    else:
        print("⚠️ بعض الـ APIs تحتاج إصلاح")

if __name__ == "__main__":
    test_all_endpoints()
